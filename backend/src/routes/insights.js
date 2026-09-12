import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import WeeklyInsight from '../models/WeeklyInsight.js';
import JournalEntry from '../models/JournalEntry.js';
import WellnessGoal from '../models/WellnessGoal.js';
import ZenSession from '../models/ZenSession.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import { callAI } from '../utils/ai.js';

const router = Router();
router.use(requireAuth);

/* ── helpers ──────────────────────────────────────────────────────────── */

// Get the most recent Sunday (IST) as YYYY-MM-DD
function lastSundayIST() {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  );
  const day = now.getDay(); // 0=Sun … 6=Sat
  now.setDate(now.getDate() - day);
  return now.toLocaleDateString('en-CA'); // YYYY-MM-DD
}

// 7-day window ending now
function weekWindow() {
  const end   = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

/* ── core generator (exported for cron too) ───────────────────────────── */
export async function generateInsightForUser(userId) {
  const weekOf = lastSundayIST();
  const { start, end } = weekWindow();

  // ── 1. Mood & Journal data ────────────────────────────────────────────
  const journalEntries = await JournalEntry.find({
    userId,
    createdAt: { $gte: start, $lte: end },
  }).select('moodScore aiTags aiTone content').lean();

  const entryCount = journalEntries.length;
  const avgMood = entryCount
    ? Math.round((journalEntries.reduce((s, e) => s + e.moodScore, 0) / entryCount) * 10) / 10
    : null;

  // Dominant tone
  const tones = journalEntries.map(e => e.aiTone).filter(Boolean);
  const toneCount = tones.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const dominantTone = Object.keys(toneCount).sort((a, b) => toneCount[b] - toneCount[a])[0] || 'neutral';

  // Recurring tags — flatten & count
  const allTags = journalEntries.flatMap(e => e.aiTags || []);
  const tagCount = allTags.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const recurringTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

  const moodSummary = { avgMood, entryCount, dominantTone, recurringTags };

  // ── 2. Goals data ────────────────────────────────────────────────────
  const goals = await WellnessGoal.find({ userId, isActive: true }).lean();
  const totalGoals = goals.length;
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    weekDates.push(d.toLocaleDateString('en-CA'));
  }
  let completedThisWeek = 0;
  goals.forEach(g => {
    const done = (g.completions || []).filter(c => weekDates.includes(c.date)).length;
    completedThisWeek += done;
  });
  const maxPossible = totalGoals * 7;
  const completionRate = maxPossible > 0 ? Math.round((completedThisWeek / maxPossible) * 100) : 0;
  const goalSummary = { totalGoals, completedThisWeek, completionRate };

  // ── 3. Session data ───────────────────────────────────────────────────
  const zenSessions = await ZenSession.countDocuments({
    userId,
    createdAt: { $gte: start, $lte: end },
  });
  const sessionSummary = { zenSessions, therapySessions: 0 };

  // ── 4. Build Groq prompt ──────────────────────────────────────────────
  const moodDesc = avgMood
    ? `Average mood: ${avgMood}/5 (${dominantTone} tone). Journal entries: ${entryCount}.${recurringTags.length ? ` Recurring themes: ${recurringTags.join(', ')}.` : ''}`
    : `No journal entries this week.`;

  const goalDesc = totalGoals > 0
    ? `Goals: ${totalGoals} active goals. Completed ${completedThisWeek} check-ins out of a possible ${maxPossible} (${completionRate}% completion rate).`
    : `No wellness goals set yet.`;

  const sessionDesc = zenSessions > 0
    ? `Had ${zenSessions} conversation${zenSessions > 1 ? 's' : ''} with Zeni AI.`
    : `No Zeni chat sessions this week.`;

  const prompt = `You are Zeni, a warm, empathetic AI wellness companion for teenagers and young adults on the ZenMind platform.

Based on this user's past 7 days of data, generate a personalised Weekly Insight Report in EXACTLY this JSON format (no markdown, no extra text):

{
  "weekInReview": "2-3 sentence paragraph starting with 'Your week in review: ...' — summarise their overall week warmly",
  "weNoticed": "2-3 sentence paragraph starting with 'We noticed: ...' — highlight specific patterns, trends, or behaviours observed from the data",
  "thisTryTry": "2-3 sentence paragraph starting with 'This week, try: ...' — give 1-2 specific, actionable, gentle recommendations"
}

User's week data:
- ${moodDesc}
- ${goalDesc}
- ${sessionDesc}

Write in second person ("you"), warm non-clinical tone, encouraging, specific. Reference actual numbers from the data. If data is sparse, be gentle and encouraging about building habits.`;

  const raw = await callAI(prompt, { maxTokens: 600, temperature: 0.55 });
  let aiText = {
    weekInReview: 'Your week in review: You\'ve taken a meaningful step by showing up this week.',
    weNoticed: 'We noticed: You\'re building consistency with your wellness journey.',
    thisTryTry: 'This week, try: Opening Zeni daily, even for just a moment to check in.',
  };

  if (raw) {
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        aiText = {
          weekInReview: parsed.weekInReview || aiText.weekInReview,
          weNoticed:    parsed.weNoticed    || aiText.weNoticed,
          thisTryTry:   parsed.thisTryTry   || aiText.thisTryTry,
        };
      }
    } catch (_) { /* keep fallback */ }
  }

  // ── 5. Surface relevant resource links ───────────────────────────────
  const tagQuery = recurringTags.length > 0
    ? { tags: { $in: recurringTags.map(t => new RegExp(t, 'i')) } }
    : {};
  const resources = await Resource.find(tagQuery).limit(3).select('_id title type url youtubeVideoId').lean();
  const resourceLinks = resources.map(r => ({
    id: r._id,
    title: r.title,
    type: r.type,
    url: r.youtubeVideoId
      ? `https://www.youtube.com/watch?v=${r.youtubeVideoId}`
      : (r.url || ''),
  }));

  // ── 6. Upsert WeeklyInsight ───────────────────────────────────────────
  const insight = await WeeklyInsight.findOneAndUpdate(
    { userId, weekOf },
    {
      moodSummary,
      goalSummary,
      sessionSummary,
      aiText,
      resourceLinks,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return insight;
}

/* ── GET /api/insights/weekly — paginated insight history ─────────────── */
router.get('/weekly', async (req, res) => {
  try {
    const limit = Math.min(20, Number(req.query.limit) || 8);
    const page  = Math.max(1, Number(req.query.page) || 1);
    const skip  = (page - 1) * limit;

    const [insights, total] = await Promise.all([
      WeeklyInsight.find({ userId: req.user.id })
        .sort({ generatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WeeklyInsight.countDocuments({ userId: req.user.id }),
    ]);

    res.json({ ok: true, insights, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Insights] fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch insights.' });
  }
});

/* ── POST /api/insights/weekly/generate — on-demand generation ────────── */
router.post('/weekly/generate', async (req, res) => {
  try {
    const insight = await generateInsightForUser(req.user.id);
    res.json({ ok: true, insight });
  } catch (err) {
    console.error('[Insights] generate error:', err.message);
    res.status(500).json({ error: 'Failed to generate insight.' });
  }
});

export default router;
