import { Router } from 'express';
import { requireAdmin } from './admin.js';
import User from '../models/User.js';
import { Session } from '../models/Session.js';
import { Therapist } from '../models/Therapist.js';
import JournalEntry from '../models/JournalEntry.js';
import WellnessGoal from '../models/WellnessGoal.js';
import Resource from '../models/Resource.js';
import ReadingList from '../models/ReadingList.js';
import CrisisLog from '../models/CrisisLog.js';
import SessionFeedback from '../models/SessionFeedback.js';
import { WellnessProgram, ProgramEnrollment } from '../models/WellnessProgram.js';
import Message from '../models/Message.js';
import ZenMessage from '../models/ZenMessage.js';

const router = Router();

/* ─────────────────────────────────────────────────────────────────────────
   HELPER UTILITIES
───────────────────────────────────────────────────────────────────────── */

// Returns a Date N days ago from now
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// Returns a Date N months ago from now
const monthsAgo = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin-analytics/overview
   All platform KPIs in one efficient call.
───────────────────────────────────────────────────────────────────────── */
router.get('/overview', requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = daysAgo(7);

    const [
      totalUsers,
      activeThisWeek,
      sessionsThisMonth,
      completedSessions,
      totalTherapists,
      totalJournalEntries,
      totalGoalCompletions,
      totalProgramEnrollments,
      avgMoodResult,
      crisisThisWeek,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastSeen: { $gte: weekAgo } }),
      Session.countDocuments({ date: { $gte: startOfMonth } }),
      Session.countDocuments({ status: 'completed' }),
      Therapist.countDocuments({ isApproved: true }),
      JournalEntry.countDocuments(),
      WellnessGoal.aggregate([{ $group: { _id: null, total: { $sum: '$totalCompleted' } } }]),
      ProgramEnrollment.countDocuments(),
      SessionFeedback.aggregate([{ $group: { _id: null, avg: { $avg: '$moodRating' } } }]),
      CrisisLog.countDocuments({ triggeredAt: { $gte: weekAgo } }),
    ]);

    // NPS approximation: % high mood (8-10) - % low mood (1-5) from post-session feedback
    const npsData = await SessionFeedback.aggregate([
      {
        $group: {
          _id: null,
          promoters:  { $sum: { $cond: [{ $gte: ['$moodRating', 8] }, 1, 0] } },
          detractors: { $sum: { $cond: [{ $lte: ['$moodRating', 5] }, 1, 0] } },
          total:      { $sum: 1 },
        },
      },
    ]);
    let nps = null;
    if (npsData.length > 0 && npsData[0].total > 0) {
      const { promoters, detractors, total } = npsData[0];
      nps = Math.round(((promoters - detractors) / total) * 100);
    }

    return res.json({
      ok: true,
      totalUsers,
      activeThisWeek,
      sessionsThisMonth,
      completedSessions,
      totalTherapists,
      totalJournalEntries,
      totalGoalCheckIns: totalGoalCompletions[0]?.total || 0,
      totalProgramEnrollments,
      averageMood: avgMoodResult[0]?.avg ? Math.round(avgMoodResult[0].avg * 10) / 10 : null,
      npsScore: nps,
      crisisEventsThisWeek: crisisThisWeek,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin-analytics/user-growth?period=12
   Monthly new user registrations. period = number of months (default 12).
───────────────────────────────────────────────────────────────────────── */
router.get('/user-growth', requireAdmin, async (req, res) => {
  try {
    const months = Math.min(24, Math.max(1, parseInt(req.query.period || '12', 10)));
    const since = monthsAgo(months);

    const data = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing months with 0
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const found = data.find(x => x._id === key);
      result.push({
        month: key,
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        count: found?.count || 0,
      });
    }

    return res.json({ ok: true, data: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin-analytics/mood-distribution
   Platform-wide AI-tagged journal mood distribution (positive/neutral/negative).
───────────────────────────────────────────────────────────────────────── */
router.get('/mood-distribution', requireAdmin, async (req, res) => {
  try {
    const data = await JournalEntry.aggregate([
      { $match: { aiTone: { $in: ['positive', 'neutral', 'negative'] } } },
      { $group: { _id: '$aiTone', count: { $sum: 1 } } },
    ]);

    const map = { positive: 0, neutral: 0, negative: 0 };
    data.forEach(d => { map[d._id] = d.count; });
    const total = map.positive + map.neutral + map.negative;

    return res.json({
      ok: true,
      total,
      positive: map.positive,
      neutral:  map.neutral,
      negative: map.negative,
      positivePct: total > 0 ? Math.round((map.positive / total) * 100) : 0,
      neutralPct:  total > 0 ? Math.round((map.neutral  / total) * 100) : 0,
      negativePct: total > 0 ? Math.round((map.negative / total) * 100) : 0,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin-analytics/session-trends?period=30
   Daily session bookings over the last N days (default 30).
───────────────────────────────────────────────────────────────────────── */
router.get('/session-trends', requireAdmin, async (req, res) => {
  try {
    const days = Math.min(90, Math.max(7, parseInt(req.query.period || '30', 10)));
    const since = daysAgo(days);

    const data = await Session.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill every day with 0 if missing
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      const found = data.find(x => x._id === key);
      result.push({
        date:  key,
        label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        count: found?.count || 0,
      });
    }

    return res.json({ ok: true, data: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin-analytics/feature-engagement
   Counts for each major feature (all-time).
───────────────────────────────────────────────────────────────────────── */
router.get('/feature-engagement', requireAdmin, async (req, res) => {
  try {
    const [
      journalEntries,
      goalCheckIns,
      programEnrollments,
      resourceViewsAgg,
      peerMessages,
      aiMessages,
      readingListSaves,
    ] = await Promise.all([
      JournalEntry.countDocuments(),
      WellnessGoal.aggregate([{ $group: { _id: null, total: { $sum: '$totalCompleted' } } }]),
      ProgramEnrollment.countDocuments(),
      Resource.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Message.countDocuments(),
      ZenMessage.countDocuments({ role: 'user' }),
      ReadingList.aggregate([{ $group: { _id: null, total: { $sum: '$saveCount' } } }]),
    ]);

    return res.json({
      ok: true,
      features: [
        { name: 'Resource Hub Views',     count: resourceViewsAgg[0]?.total || 0 },
        { name: 'Journal Entries',         count: journalEntries },
        { name: 'Goal Check-ins',          count: goalCheckIns[0]?.total || 0 },
        { name: 'Wellness Enrollments',    count: programEnrollments },
        { name: 'AI Chat Messages',        count: aiMessages },
        { name: 'Peer Circle Messages',    count: peerMessages },
        { name: 'Reading List Saves',      count: readingListSaves[0]?.total || 0 },
      ].sort((a, b) => b.count - a.count),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin-analytics/therapist-leaderboard
   Top therapists by sessions completed + avg rating.
───────────────────────────────────────────────────────────────────────── */
router.get('/therapist-leaderboard', requireAdmin, async (req, res) => {
  try {
    const therapistData = await Session.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id:           '$therapist',
          sessionsCompleted: { $sum: 1 },
          therapistName: { $first: '$therapistName' },
        },
      },
      { $sort: { sessionsCompleted: -1 } },
      { $limit: 10 },
    ]);

    // Fetch ratings from Therapist model
    const ids = therapistData.map(t => t._id);
    const therapists = await Therapist.find({ _id: { $in: ids } })
      .select('_id name ratingAverage ratingCount specialization')
      .lean();

    const therapistMap = {};
    therapists.forEach(t => { therapistMap[String(t._id)] = t; });

    const leaderboard = therapistData.map(t => {
      const detail = therapistMap[String(t._id)] || {};
      return {
        therapistId:       String(t._id),
        name:              detail.name || t.therapistName,
        specialization:    detail.specialization || '—',
        sessionsCompleted: t.sessionsCompleted,
        avgRating:         detail.ratingAverage ? Math.round(detail.ratingAverage * 10) / 10 : null,
        ratingCount:       detail.ratingCount || 0,
      };
    });

    return res.json({ ok: true, leaderboard });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin-analytics/content-performance
   Top resources, most-enrolled programs, reading list stats.
───────────────────────────────────────────────────────────────────────── */
router.get('/content-performance', requireAdmin, async (req, res) => {
  try {
    const [topResources, topPrograms, topReadingLists, crisisWeekly] = await Promise.all([
      Resource.find().sort({ views: -1 }).limit(5).select('title type views tags').lean(),
      WellnessProgram.find({ isPublished: true })
        .sort({ enrollmentCount: -1 })
        .limit(5)
        .select('title category enrollmentCount durationDays')
        .lean(),
      ReadingList.find({ isPublished: true, isApproved: true })
        .sort({ saveCount: -1 })
        .limit(5)
        .select('title therapistName saveCount category')
        .lean(),
      // Crisis events last 8 weeks grouped by ISO week
      CrisisLog.aggregate([
        { $match: { triggeredAt: { $gte: daysAgo(56) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-W%V', date: '$triggeredAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return res.json({
      ok: true,
      topResources,
      topPrograms,
      topReadingLists,
      crisisWeekly,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
