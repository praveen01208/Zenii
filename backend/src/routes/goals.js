import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import WellnessGoal from '../models/WellnessGoal.js';

const router = Router();
router.use(requireAuth);

const todayIST = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // 'YYYY-MM-DD'

/* ── Compute streak from sorted completion dates ── */
function computeStreak(dates) {
  if (!dates.length) return { current: 0, longest: 0 };

  const sorted = [...new Set(dates)].sort(); // unique sorted YYYY-MM-DD
  let longest = 1, current = 1;
  const today = todayIST();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((curr - prev) / 86400000);
    if (diff === 1) { current++; longest = Math.max(longest, current); }
    else current = 1;
  }

  // Current streak is 0 if last completion isn't today or yesterday
  const last = sorted[sorted.length - 1];
  if (last !== today && last !== yesterdayStr) current = 0;

  return { current, longest };
}

/* ── GET /api/goals ── */
router.get('/', async (req, res) => {
  try {
    const goals = await WellnessGoal.find({ userId: req.user.id, isArchived: false })
      .sort({ createdAt: -1 }).lean();
    const today = todayIST();
    const mapped = goals.map(g => ({
      ...g,
      completedToday: g.completions.some(c => c.date === today),
    }));
    res.json({ ok: true, goals: mapped });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals.' });
  }
});

/* ── POST /api/goals ── */
router.post('/', async (req, res) => {
  try {
    const { title, description, category, frequency, targetDays, color } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' });

    const goal = await WellnessGoal.create({
      userId:     req.user.id,
      title:      title.trim(),
      description: description?.trim() || '',
      category:   category   || 'other',
      frequency:  frequency  || 'daily',
      targetDays: targetDays || 21,
      color:      color      || '#0d5d3a',
    });
    res.status(201).json({ ok: true, goal: { ...goal.toObject(), completedToday: false } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal.' });
  }
});

/* ── PATCH /api/goals/:id/complete — toggle today's completion ── */
router.patch('/:id/complete', async (req, res) => {
  try {
    const goal = await WellnessGoal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    const today = todayIST();
    const alreadyDone = goal.completions.some(c => c.date === today);

    if (alreadyDone) {
      // Un-complete today
      goal.completions = goal.completions.filter(c => c.date !== today);
    } else {
      goal.completions.push({ date: today });
    }

    const dates = goal.completions.map(c => c.date);
    const { current, longest } = computeStreak(dates);
    goal.currentStreak  = current;
    goal.longestStreak  = Math.max(longest, goal.longestStreak);
    goal.totalCompleted = goal.completions.length;

    await goal.save();
    res.json({
      ok:             true,
      completedToday: !alreadyDone,
      currentStreak:  goal.currentStreak,
      longestStreak:  goal.longestStreak,
      totalCompleted: goal.totalCompleted,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update completion.' });
  }
});

/* ── PATCH /api/goals/:id — edit goal metadata ── */
router.patch('/:id', async (req, res) => {
  try {
    const goal = await WellnessGoal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    const allowed = ['title', 'description', 'category', 'targetDays', 'color', 'isActive'];
    allowed.forEach(k => { if (req.body[k] !== undefined) goal[k] = req.body[k]; });
    await goal.save();
    res.json({ ok: true, goal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal.' });
  }
});

/* ── DELETE /api/goals/:id ── */
router.delete('/:id', async (req, res) => {
  try {
    await WellnessGoal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete goal.' });
  }
});

/* ── GET /api/goals/stats ── */
router.get('/stats', async (req, res) => {
  try {
    const goals = await WellnessGoal.find({ userId: req.user.id, isArchived: false }).lean();
    const totalGoals      = goals.length;
    const today           = todayIST();
    const completedToday  = goals.filter(g => g.completions.some(c => c.date === today)).length;
    const longestStreak   = goals.reduce((m, g) => Math.max(m, g.longestStreak), 0);
    const totalCompletions = goals.reduce((s, g) => s + g.totalCompleted, 0);

    // Overall completion rate (all time)
    const rate = totalGoals
      ? Math.round((goals.filter(g => g.completions.some(c => c.date === today)).length / totalGoals) * 100)
      : 0;

    res.json({ ok: true, stats: { totalGoals, completedToday, longestStreak, totalCompletions, todayRate: rate } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats.' });
  }
});

export default router;
