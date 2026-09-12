import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { handleCreditReset, hasCredits, deductOneCredit } from '../middleware/planCheck.js';
import ZenSession from '../models/ZenSession.js';
import ZenMessage from '../models/ZenMessage.js';
import CrisisLog from '../models/CrisisLog.js';
import User from '../models/User.js';
import { generateZeniChatReply } from '../utils/ai.js';

const router = Router();

// ── ISO Week helper ────────────────────────────────────────────────────────────
function getISOWeekString(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ── Privacy helper ─────────────────────────────────────────────────────────────
function hashUserId(userId) {
  return crypto.createHash('sha256').update(String(userId)).digest('hex');
}

// ── Crisis keyword definitions ─────────────────────────────────────────────────
// Grouped by category. Text is lowercased before matching.
// Phrases chosen carefully — broad enough to catch real signals, narrow enough to
// avoid false positives on casual language.
const CRISIS_PATTERNS = [
  {
    category: 'suicide_ideation',
    phrases: [
      'end my life', 'ending my life', 'take my life', 'taking my life',
      'kill myself', 'killing myself', 'want to die', 'wants to die',
      'wish i was dead', 'wish i were dead', 'better off dead',
      'no reason to live', 'not worth living', 'don\'t want to be alive',
      'dont want to be alive', 'suicidal', 'suicide',
    ],
  },
  {
    category: 'self_harm',
    phrases: [
      'hurt myself', 'hurting myself', 'cut myself', 'cutting myself',
      'self harm', 'self-harm', 'selfharm', 'harming myself',
      'burn myself', 'burning myself', 'harm myself',
    ],
  },
  {
    category: 'severe_distress',
    phrases: [
      'can\'t go on', 'cant go on', 'cannot go on', 'can\'t take it anymore',
      'cant take it anymore', 'cannot take it anymore', 'give up on life',
      'giving up on life', 'have nothing to live for', 'has nothing to live for',
      'life is not worth', 'feel hopeless', 'feeling hopeless', 'no hope left',
      'lost all hope', 'completely hopeless',
    ],
  },
  {
    category: 'hindi_crisis',
    phrases: [
      'marna chahta', 'marna chahti', 'mar jaana chahta', 'mar jaana chahti',
      'jeena nahi', 'jina nahi', 'zindagi nahi chahiye', 'khud ko hurt karna',
      'khud ko cut karna', 'maut chahiye', 'khatam karna chahta', 'khatam karna chahti',
    ],
  },
];

/**
 * Checks whether a user message contains a crisis signal.
 * Returns { triggered: boolean, category?: string } — never throws.
 */
function checkCrisisKeywords(message) {
  if (!message || typeof message !== 'string') return { triggered: false };
  const lower = message.toLowerCase().trim();
  for (const group of CRISIS_PATTERNS) {
    for (const phrase of group.phrases) {
      if (lower.includes(phrase)) {
        return { triggered: true, category: group.category };
      }
    }
  }
  return { triggered: false };
}

// ── Per-user cooldown map (in-memory, resets on server restart) ────────────────
// Prevents log spam if user repeatedly sends crisis messages in quick succession.
const CRISIS_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
const lastCrisisTime = new Map(); // userId -> timestamp

/**
 * POST /api/zen-chat
 * Handles a Zeni AI reply and persists messages to MongoDB.
 *
 * Body: { messages: [{role, content}], sessionId?: string }
 * Returns: { reply, sessionId }
 *
 * Session lifecycle:
 *   - No sessionId → creates a new ZenSession automatically
 *   - sessionId provided → appends to existing session
 *   - DB writes are fire-and-forget (never delay the AI response)
 *
 * Crisis flow:
 *   - Latest user message is scanned BEFORE the Groq call
 *   - If a crisis keyword is detected: skip Groq, return crisis type response
 *   - Log is stored anonymized (hashed userId + phrase category + ISO week)
 *   - 10-minute per-user cooldown prevents log flooding
 */
router.post('/', requireAuth, async (req, res) => {
  const { messages, sessionId: incomingSessionId } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  // Load user and run IST-based credit reset / subscription expiry
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await handleCreditReset(user);

  // ── Detect whether this is a "welcome" call (no user message yet) ──────
  // Zeni's opening greeting is NOT counted — only real user→AI exchanges count.
  const latestUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const isWelcomeCall = !latestUserMsg;

  // Check credits only when the user has actually sent a message
  if (!isWelcomeCall && !hasCredits(user)) {
    return res.status(403).json({
      error: 'You have run out of AI Chat credits for this week. Please upgrade your plan.',
      creditsLeft: 0,
    });
  }

  // ── Resolve / create session ────────────────────────────────────────────
  let sessionId = incomingSessionId || null;
  let session = null;

  try {
    if (sessionId) {
      session = await ZenSession.findOne({ _id: sessionId, userId: req.user.id });
    }

    if (!session) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 70).replace(/\n/g, ' ')
        : 'New Conversation';
      session = await ZenSession.create({ userId: req.user.id, title });
      sessionId = session._id.toString();
    }
  } catch (dbErr) {
    console.error('[ZenChat] Session resolve error:', dbErr.message);
  }

  // ── Persist user's latest message (fire-and-forget) ─────────────────────
  if (session && latestUserMsg) {
    ZenMessage.create({
      sessionId: session._id,
      role: 'user',
      content: latestUserMsg.content,
    }).catch(e => console.error('[ZenChat] Save user msg error:', e.message));
  }

  // ── 🚨 CRISIS KEYWORD SCAN (runs BEFORE any AI call) ────────────────────
  if (latestUserMsg) {
    const { triggered, category } = checkCrisisKeywords(latestUserMsg.content);

    if (triggered) {
      const userId = req.user.id;
      const now = Date.now();
      const lastTime = lastCrisisTime.get(userId) || 0;
      const inCooldown = (now - lastTime) < CRISIS_COOLDOWN_MS;

      if (!inCooldown) {
        // Update cooldown timestamp
        lastCrisisTime.set(userId, now);

        // Persist anonymized log (fire-and-forget — never blocks response)
        CrisisLog.create({
          userHash: hashUserId(userId),
          phraseCategory: category,
          isoWeek: getISOWeekString(),
        }).catch(e => console.error('[ZenChat] Crisis log error:', e.message));
      }

      // Build a warm, non-alarmist empathy response
      const crisisReply = `I hear you, and what you're feeling right now is real and valid. I'm really glad you're talking to me. You don't have to carry this alone — reaching out like this takes real courage. Can you tell me a little more about what's been happening for you?\n\n[ACTION:CRISIS]`;

      // Save assistant crisis reply (fire-and-forget)
      if (session) {
        Promise.all([
          ZenMessage.create({
            sessionId: session._id,
            role: 'assistant',
            content: crisisReply,
            action: 'CRISIS',
          }),
          ZenSession.findByIdAndUpdate(session._id, { $inc: { messageCount: 2 } }),
        ]).catch(e => console.error('[ZenChat] Save crisis msg error:', e.message));
      }

      return res.json({ reply: crisisReply, sessionId });
    }
  }

  // Welcome call (no user message yet) — nothing for the AI to respond to.
  if (isWelcomeCall) {
    const greeting = "Hey, I'm Zeni  I'm here for you — no judgment, just support. How are you feeling today?";
    return res.json({ reply: greeting, sessionId });
  }

  // ── Call Zeni ACPE Pipeline for Mental Wellness Response ──────────────
  const conversationHistory = messages.slice(0, -1).map(({ role, content }) => ({ role, content }));

  try {
    const userCity = user.city || '';
    const userGoals = (user.onboardingData?.goals || []).join(', ');
    const userContextStr = `Name: ${user.name || 'Friend'}. Tier: ${user.subscriptionTier || 'free'}.${userGoals ? ` Focus areas: ${userGoals}.` : ''}`;

    const acpeResult = await generateZeniChatReply({
      sessionId: String(sessionId || session?._id || 'default_session'),
      conversationHistory,
      latestUserMessage: latestUserMsg.content,
      userCity,
      userContext: userContextStr,
    });

    const reply = typeof acpeResult === 'string' ? acpeResult : (acpeResult?.reply || '');

    if (!reply) {
      return res.status(502).json({ error: 'Empty response from AI service.' });
    }

    // ── Detect action tag to persist alongside assistant message ─────────
    const ACTION_RE = /\[ACTION:(STORY_BUTTONS|POST_STORY|THERAPY_BUTTON|CRISIS)\]/g;
    const actionMatch = new RegExp(ACTION_RE.source, 'g').exec(reply);
    const detectedAction = actionMatch ? actionMatch[1] : null;

    // ── Persist assistant reply (fire-and-forget) ─────────────────────────
    if (session) {
      Promise.all([
        ZenMessage.create({
          sessionId: session._id,
          role: 'assistant',
          content: reply,
          action: detectedAction,
        }),
        ZenSession.findByIdAndUpdate(session._id, {
          $inc: { messageCount: 2 }, // user + assistant
        }),
      ]).catch(e => console.error('[ZenChat] Save assistant msg error:', e.message));
    }

    // Deduct one credit — only for real user messages, never for the welcome call.
    if (!isWelcomeCall) {
      await deductOneCredit(user);
    }

    // Attach remaining credits in response so the frontend can update its counter
    const updatedCredits = user.subscriptionTier === 'platinum'
      ? null   // null = unlimited; frontend shows ∞
      : Math.max(0, (user.aiWeeklyCredits || 0) - (isWelcomeCall ? 0 : 1));

    return res.json({
      reply,
      sessionId,
      creditsLeft: updatedCredits,
      vad: acpeResult?.vad || [0.5, 0.5, 0.5],
      riskTier: acpeResult?.riskTier || 'calm',
      topEmotion: acpeResult?.topEmotion || 'neutral',
    });
  } catch (err) {
    console.error('[ZenChat] AI Error:', err.message);

    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI service took too long to respond. Please try again.' });
    }

    return res.status(500).json({ error: err.message || 'Failed to connect to AI service.' });
  }
});

export default router;
