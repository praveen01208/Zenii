import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import ZenSession from '../models/ZenSession.js';
import ZenMessage from '../models/ZenMessage.js';
import DailyMood from '../models/DailyMood.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/zen-progress?range=weekly|monthly
 *
 * Returns aggregated chart data for the logged-in user:
 *   - Daily session counts
 *   - Daily message counts
 *   - Mood scores (passive from sessions + active from DailyMood)
 *   - Category breakdown
 *   - Summary stats (total sessions, avg mood, streak)
 */
router.get('/', async (req, res) => {
  try {
    const range = req.query.range === 'monthly' ? 'monthly' : 'weekly';
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();
    const days = range === 'monthly' ? 30 : 7;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Build labels array (e.g. ["Mon","Tue",...] for weekly, ["May 1",...] for monthly)
    const labels = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      if (range === 'weekly') {
        labels.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));
      } else {
        labels.push(d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
      }
    }

    // ── Sessions per day (MongoDB aggregation) ──────────────────────────────
    const sessionAgg = await ZenSession.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' }
          },
          count: { $sum: 1 },
          avgMood: { $avg: '$moodScore' },
        }
      }
    ]);
    const sessionMap = {};
    sessionAgg.forEach(s => { sessionMap[s._id] = { count: s.count, mood: s.avgMood }; });

    // ── Messages per day ────────────────────────────────────────────────────
    // Get session IDs for this user first
    const userSessionIds = await ZenSession
      .find({ userId: req.user.id })
      .distinct('_id');

    const msgAgg = await ZenMessage.aggregate([
      {
        $match: {
          sessionId: { $in: userSessionIds },
          role: 'user', // only count user messages for "activity"
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    const msgMap = {};
    msgAgg.forEach(m => { msgMap[m._id] = m.count; });

    // ── Active daily mood check-ins ─────────────────────────────────────────
    const moodRecords = await DailyMood.find({
      userId: req.user.id,
      createdAt: { $gte: startDate }
    }).select('day score');
    const moodMap = {};
    moodRecords.forEach(m => { moodMap[m.day] = m.score; });

    // ── Category breakdown ──────────────────────────────────────────────────
    const catAgg = await ZenSession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), createdAt: { $gte: startDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const categoryBreakdown = {};
    catAgg.forEach(c => { categoryBreakdown[c._id] = c.count; });

    // ── Build per-day arrays ────────────────────────────────────────────────
    const sessionsPerDay = [];
    const messagesPerDay = [];
    const moodPerDay = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10); // 'YYYY-MM-DD'

      sessionsPerDay.push(sessionMap[key]?.count || 0);
      messagesPerDay.push(msgMap[key] || 0);

      // Prefer active check-in; fall back to passive session mood
      const activeMood = moodMap[key] || null;
      const passiveMood = sessionMap[key]?.mood ? Math.round(sessionMap[key].mood) : null;
      moodPerDay.push(activeMood ?? passiveMood);
    }

    // ── Summary stats ───────────────────────────────────────────────────────
    const totalSessions = sessionsPerDay.reduce((a, b) => a + b, 0);
    const totalMessages = messagesPerDay.reduce((a, b) => a + b, 0);
    const moodValues = moodPerDay.filter(m => m !== null);
    const avgMood = moodValues.length
      ? Math.round((moodValues.reduce((a, b) => a + b, 0) / moodValues.length) * 10) / 10
      : null;

    // Streak = consecutive days with at least 1 session (looking backwards from today)
    let streak = 0;
    for (let i = sessionsPerDay.length - 1; i >= 0; i--) {
      if (sessionsPerDay[i] > 0) streak++;
      else break;
    }

    res.json({
      range,
      labels,
      sessionsPerDay,
      messagesPerDay,
      moodPerDay,
      categoryBreakdown,
      summary: {
        totalSessions,
        totalMessages,
        avgMood,
        streak,
        daysTracked: days,
      }
    });
  } catch (err) {
    console.error('[ZenProgress] error:', err.message);
    res.status(500).json({ error: 'Failed to load progress data' });
  }
});

// ── POST /api/zen-progress/mood
// Save an active daily mood check-in (from the daily slider)
router.post('/mood', async (req, res) => {
  try {
    const score = Number(req.body.score);
    if (!score || score < 1 || score > 10) {
      return res.status(400).json({ error: 'score must be between 1 and 10' });
    }
    const note = String(req.body.note || '').slice(0, 200);

    // Today's date as 'YYYY-MM-DD' in IST
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // 'YYYY-MM-DD'

    const mood = await DailyMood.findOneAndUpdate(
      { userId: req.user.id, day: today },
      { $set: { score, note } },
      { upsert: true, new: true }
    );

    res.json({ ok: true, mood });
  } catch (err) {
    console.error('[ZenProgress] mood save error:', err.message);
    res.status(500).json({ error: 'Failed to save mood' });
  }
});

// ── GET /api/zen-progress/mood/today
// Check if user has already checked in today
router.get('/mood/today', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const mood = await DailyMood.findOne({ userId: req.user.id, day: today });
    res.json({ checkedIn: !!mood, score: mood?.score || null, note: mood?.note || '' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check mood status' });
  }
});

export default router;
