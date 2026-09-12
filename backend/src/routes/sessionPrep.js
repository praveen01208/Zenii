import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from './admin.js';
import { Session } from '../models/Session.js';
import SessionPrep from '../models/SessionPrep.js';
import SessionFeedback from '../models/SessionFeedback.js';
import Notification from '../models/Notification.js';
import { callAI } from '../utils/ai.js';

const router = Router();

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/session-prep/upcoming
   Returns the next upcoming booked session + any existing prep for it.
───────────────────────────────────────────────────────────────────────── */
router.get('/upcoming', requireAuth, async (req, res) => {
  try {
    const now = new Date();
    // Find the single next booked session
    const session = await Session.findOne({
      user: req.user.id,
      status: 'booked',
      date: { $gte: now },
    }).sort({ date: 1 }).lean();

    if (!session) return res.json({ ok: true, session: null, prep: null });

    // Find existing prep
    const prep = await SessionPrep.findOne({ sessionId: session._id }).lean();

    return res.json({ ok: true, session, prep });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/session-prep/:sessionId/generate
   Generate AI reflection prompts for the given session.
   Idempotent — returns existing prompts if already generated.
───────────────────────────────────────────────────────────────────────── */
router.post('/:sessionId/generate', requireAuth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, user: req.user.id }).lean();
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Return existing if already generated
    const existing = await SessionPrep.findOne({ sessionId: session._id });
    if (existing && existing.prompts.length > 0) {
      return res.json({ ok: true, prep: existing });
    }

    // Generate 3 reflection prompts via AI
    const specialty = session.therapistSpecialty || '';
    const systemPrompt = `You are a compassionate therapist preparation assistant. Generate exactly 3 short, thoughtful reflection prompts to help a user prepare for their upcoming therapy session. Prompts should be open-ended, warm, non-threatening, and help the user identify what they want to work on. Each prompt should be on a new line, numbered 1. 2. 3. — nothing else.`;
    const userPrompt = `The therapist's name is ${session.therapistName}${specialty ? ` and they specialise in ${specialty}` : ''}. Session is soon. Create 3 personalised reflection prompts.`;

    let prompts = [];
    const aiText = await callAI(userPrompt, { system: systemPrompt, maxTokens: 400, temperature: 0.7 });
    if (aiText) {
      prompts = aiText
        .split('\n')
        .filter(l => l.trim().match(/^[1-3][\.\)]/))
        .map(l => l.replace(/^[1-3][\.\)]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 3);
    }

    // Fallback prompts if AI fails or returns malformed output
    if (prompts.length < 3) {
      prompts = [
        `What's been weighing on your mind the most this week?`,
        `What would a successful session look like for you today?`,
        `Is there something you've been hesitant to bring up? Now's a safe space.`,
      ];
    }

    const prep = await SessionPrep.findOneAndUpdate(
      { sessionId: session._id },
      {
        sessionId:     session._id,
        userId:        req.user.id,
        therapistName: session.therapistName,
        specialty,
        sessionDate:   session.date,
        prompts,
        promptsSavedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.json({ ok: true, prep });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   PATCH /api/session-prep/:sessionId/response
   Save the user's written intention for the session.
───────────────────────────────────────────────────────────────────────── */
router.patch('/:sessionId/response', requireAuth, async (req, res) => {
  try {
    const { userResponse } = req.body;
    if (typeof userResponse !== 'string') return res.status(400).json({ error: 'userResponse required' });

    const prep = await SessionPrep.findOneAndUpdate(
      { sessionId: req.params.sessionId, userId: req.user.id },
      { userResponse: userResponse.slice(0, 2000) },
      { new: true }
    );
    if (!prep) return res.status(404).json({ error: 'Prep not found' });

    return res.json({ ok: true, prep });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/session-prep/completed
   Returns completed sessions that don't yet have feedback — triggers PostSessionModal.
───────────────────────────────────────────────────────────────────────── */
router.get('/completed', requireAuth, async (req, res) => {
  try {
    // Sessions completed in the last 7 days without feedback
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sessions = await Session.find({
      user: req.user.id,
      status: 'completed',
      date: { $gte: since },
    }).sort({ date: -1 }).lean();

    if (sessions.length === 0) return res.json({ ok: true, session: null });

    // Check which ones are missing feedback
    const sessionIds = sessions.map(s => s._id);
    const feedbackDone = await SessionFeedback.find({ sessionId: { $in: sessionIds } }).distinct('sessionId');
    const feedbackSet  = new Set(feedbackDone.map(String));

    const pending = sessions.find(s => !feedbackSet.has(String(s._id)));
    return res.json({ ok: true, session: pending || null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/session-prep/:sessionId/feedback
   Save post-session feedback. AI-suggests resources based on takeaways.
───────────────────────────────────────────────────────────────────────── */
router.post('/:sessionId/feedback', requireAuth, async (req, res) => {
  try {
    const { moodRating, takeaways } = req.body;
    if (!moodRating || moodRating < 1 || moodRating > 10) {
      return res.status(400).json({ error: 'moodRating must be 1–10' });
    }

    const session = await Session.findOne({ _id: req.params.sessionId, user: req.user.id }).lean();
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Prevent duplicate feedback
    const existing = await SessionFeedback.findOne({ sessionId: session._id });
    if (existing) return res.json({ ok: true, feedback: existing });

    // AI-suggested resources based on takeaways
    let suggestedResources = [];
    if (takeaways && takeaways.trim().length > 20) {
      const sysPrompt = `You are a mental health resource curator. Based on a user's post-therapy session notes, suggest 2 specific, helpful self-help resources (articles, exercises, or practices). Return ONLY a JSON array like: [{"title":"...","url":"..."},{"title":"...","url":"..."}]. Use real, publicly accessible wellness resource URLs.`;
      const aiText = await callAI(`User's session takeaways: "${takeaways.slice(0, 500)}"`, { system: sysPrompt, maxTokens: 400 });
      if (aiText) {
        try {
          const match = aiText.match(/\[[\s\S]*?\]/);
          if (match) suggestedResources = JSON.parse(match[0]).slice(0, 2);
        } catch { /* ignore parse errors */ }
      }
    }

    const feedback = await SessionFeedback.create({
      sessionId:     session._id,
      userId:        req.user.id,
      therapistName: session.therapistName,
      sessionDate:   session.date,
      moodRating:    Math.min(10, Math.max(1, moodRating)),
      takeaways:     (takeaways || '').slice(0, 3000),
      suggestedResources,
    });

    // Fire-and-forget: notification if mood is high
    if (moodRating >= 7) {
      Notification.create({
        userId:    req.user.id,
        type:      'system',
        title:     '🎉 Great job investing in yourself!',
        body:      `You rated your session ${moodRating}/10. Keep the momentum — check out your suggested resources.`,
        actionTab: 'therapy',
      }).catch(() => {});
    }

    return res.status(201).json({ ok: true, feedback });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/session-prep/my-feedback
   Returns all past feedback entries for the current user (history view).
───────────────────────────────────────────────────────────────────────── */
router.get('/my-feedback', requireAuth, async (req, res) => {
  try {
    const feedbacks = await SessionFeedback.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return res.json({ ok: true, feedbacks });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin/analytics/post-session-mood
   Mounted at: app.use('/api/admin/analytics', sessionPrepRoute)
   Anonymized aggregate: average mood, distribution, trend over 8 weeks.
───────────────────────────────────────────────────────────────────────── */
router.get('/post-session-mood', requireAdmin, async (req, res) => {
  try {
    const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);

    const [totalCount, avgResult, dist, weekly] = await Promise.all([
      SessionFeedback.countDocuments(),
      SessionFeedback.aggregate([{ $group: { _id: null, avg: { $avg: '$moodRating' } } }]),
      // Distribution buckets: 1-3 (low), 4-6 (mid), 7-10 (high)
      SessionFeedback.aggregate([
        {
          $group: {
            _id: null,
            low:  { $sum: { $cond: [{ $lte: ['$moodRating', 3] }, 1, 0] } },
            mid:  { $sum: { $cond: [{ $and: [{ $gte: ['$moodRating', 4] }, { $lte: ['$moodRating', 6] }] }, 1, 0] } },
            high: { $sum: { $cond: [{ $gte: ['$moodRating', 7] }, 1, 0] } },
          },
        },
      ]),
      // Weekly average over last 8 weeks
      SessionFeedback.aggregate([
        { $match: { createdAt: { $gte: eightWeeksAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
            avgMood: { $avg: '$moodRating' },
            count:   { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return res.json({
      ok: true,
      totalFeedbacks: totalCount,
      averageMood: avgResult[0]?.avg ? Math.round(avgResult[0].avg * 10) / 10 : null,
      distribution: dist[0] || { low: 0, mid: 0, high: 0 },
      weeklyTrend: weekly,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
