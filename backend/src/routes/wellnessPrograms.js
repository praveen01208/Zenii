import { Router } from 'express';
import { WellnessProgram, ProgramEnrollment } from '../models/WellnessProgram.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from './admin.js';

const router = Router();

/* ══════════════════════════════════════════════════════════
   STATIC NAMED ROUTES — must come BEFORE /:id wildcard
══════════════════════════════════════════════════════════ */

/** GET  /user/my-programs  — user's enrolled programs */
router.get('/user/my-programs', requireAuth, async (req, res) => {
  try {
    const enrollments = await ProgramEnrollment.find({ userId: req.user.id })
      .populate('programId', 'title description category difficulty durationDays coverGradientFrom coverGradientTo enrollmentCount')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ ok: true, enrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET  /admin/list  — all programs (admin) */
router.get('/admin/list', requireAdmin, async (req, res) => {
  try {
    const programs = await WellnessProgram.find().sort({ createdAt: -1 }).lean();
    const totalEnrollments = await ProgramEnrollment.countDocuments();
    res.json({ ok: true, programs, totalEnrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /admin  — create program */
router.post('/admin', requireAdmin, async (req, res) => {
  try {
    const { title, description, category, difficulty, durationDays, steps, isPublished, coverGradientFrom, coverGradientTo } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' });
    if (!durationDays || durationDays < 1) return res.status(400).json({ error: 'Duration must be at least 1 day.' });

    const cleanSteps = (Array.isArray(steps) ? steps : []).map((s, i) => ({
      dayNumber: s.dayNumber || (i + 1),
      title: s.title?.trim() || `Day ${i + 1}`,
      content: s.content?.trim() || 'Follow your daily wellness routine.',
      exerciseType: s.exerciseType || 'other',
      durationMinutes: Number(s.durationMinutes) || 10
    }));

    const program = await WellnessProgram.create({
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'other',
      difficulty: difficulty || 'beginner',
      durationDays: Math.max(1, cleanSteps.length),
      steps: cleanSteps,
      isPublished: isPublished !== false,
      coverGradientFrom: coverGradientFrom || '#0d5d3a',
      coverGradientTo: coverGradientTo || '#1a8a5a',
    });
    res.status(201).json({ ok: true, program });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PUT /admin/:id  — update program */
router.put('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const program = await WellnessProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ error: 'Program not found.' });

    const fields = ['title', 'description', 'category', 'difficulty', 'durationDays', 'isPublished', 'coverGradientFrom', 'coverGradientTo'];
    fields.forEach(f => { if (req.body[f] !== undefined) program[f] = req.body[f]; });
    if (req.body.title) program.title = req.body.title.trim();

    if (req.body.steps && Array.isArray(req.body.steps)) {
      program.steps = req.body.steps.map((s, i) => ({
        dayNumber: s.dayNumber || (i + 1),
        title: s.title?.trim() || `Day ${i + 1}`,
        content: s.content?.trim() || 'Follow your daily wellness routine.',
        exerciseType: s.exerciseType || 'other',
        durationMinutes: Number(s.durationMinutes) || 10
      }));
      program.durationDays = Math.max(1, program.steps.length);
    } else if (req.body.durationDays) {
      program.durationDays = Math.max(1, Number(req.body.durationDays));
    }

    await program.save();
    res.json({ ok: true, program });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /admin/:id  — delete program + enrollments */
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    await WellnessProgram.findByIdAndDelete(req.params.id);
    await ProgramEnrollment.deleteMany({ programId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /admin/:id/toggle  — toggle published status */
router.patch('/admin/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const program = await WellnessProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ error: 'Program not found.' });
    program.isPublished = !program.isPublished;
    await program.save();
    res.json({ ok: true, isPublished: program.isPublished });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════════════
/* ══════════════════════════════════════════════════════════
   USER BROWSE ROUTES — / and /:id (wildcard — must be LAST)
══════════════════════════════════════════════════════════ */

/** POST /custom  — user creates a custom program */
router.post('/custom', requireAuth, async (req, res) => {
  try {
    const { title, description, category, difficulty, durationDays, steps, visibility } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' });
    if (!durationDays || durationDays < 1) return res.status(400).json({ error: 'Duration must be at least 1 day.' });

    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.id).select('name').lean();

    const cleanSteps = (Array.isArray(steps) ? steps : []).map((s, i) => ({
      dayNumber: s.dayNumber || (i + 1),
      title: s.title?.trim() || `Day ${i + 1}`,
      content: s.content?.trim() || 'Follow your daily wellness routine.',
      exerciseType: s.exerciseType || 'other',
      durationMinutes: Number(s.durationMinutes) || 10
    }));

    const program = await WellnessProgram.create({
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'other',
      difficulty: difficulty || 'beginner',
      durationDays: Math.max(1, cleanSteps.length),
      steps: cleanSteps,
      isPublished: true, // Auto publish custom programs
      isCustom: true,
      createdBy: req.user.id,
      authorName: user?.name || 'Anonymous User',
      visibility: visibility === 'public' ? 'public' : 'private',
      coverGradientFrom: '#0f172a',
      coverGradientTo: '#1e293b'
    });

    // Auto-enroll the creator immediately for free
    const enrollment = await ProgramEnrollment.create({
      userId: req.user.id,
      programId: program._id,
      currentDay: 1,
      completedDays: [],
    });
    program.enrollmentCount = 1;
    await program.save();

    res.status(201).json({ ok: true, program, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET  /my-custom  — user's created custom programs */
router.get('/my-custom', requireAuth, async (req, res) => {
  try {
    const programs = await WellnessProgram.find({ createdBy: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ ok: true, programs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET  /public  — public custom programs from users */
router.get('/public', requireAuth, async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    const q = { isPublished: true, isCustom: true, visibility: 'public' };
    if (category && category !== 'all') q.category = category;
    if (difficulty && difficulty !== 'all') q.difficulty = difficulty;
    if (search) {
      const re = new RegExp(search, 'i');
      q.$or = [{ title: re }, { description: re }];
    }

    const programs = await WellnessProgram.find(q)
      .select('-steps')
      .sort({ enrollmentCount: -1, createdAt: -1 })
      .lean();

    const enrollments = await ProgramEnrollment.find({
      userId: req.user.id,
      programId: { $in: programs.map(p => p._id) },
    }).lean();

    const enrollMap = {};
    enrollments.forEach(e => { enrollMap[String(e.programId)] = e; });

    res.json({ ok: true, programs: programs.map(p => ({ ...p, enrollment: enrollMap[String(p._id)] || null })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET  /  — all published programs with enrollment status (official programs) */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    const q = { isPublished: true, isCustom: false };
    if (category && category !== 'all') q.category = category;
    if (difficulty && difficulty !== 'all') q.difficulty = difficulty;
    if (search) {
      const re = new RegExp(search, 'i');
      q.$or = [{ title: re }, { description: re }];
    }

    const programs = await WellnessProgram.find(q)
      .select('-steps')
      .sort({ enrollmentCount: -1, createdAt: -1 })
      .lean();

    const enrollments = await ProgramEnrollment.find({
      userId: req.user.id,
      programId: { $in: programs.map(p => p._id) },
    }).lean();

    const enrollMap = {};
    enrollments.forEach(e => { enrollMap[String(e.programId)] = e; });

    res.json({ ok: true, programs: programs.map(p => ({ ...p, enrollment: enrollMap[String(p._id)] || null })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET  /:id  — full program detail + user enrollment (WILDCARD — keep last) */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const program = await WellnessProgram.findOne({ _id: req.params.id, isPublished: true }).lean();
    if (!program) return res.status(404).json({ error: 'Program not found.' });

    const enrollment = await ProgramEnrollment.findOne({
      userId: req.user.id,
      programId: req.params.id,
    }).lean();

    res.json({ ok: true, program, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /:id/enroll  — enroll in a program */
router.post('/:id/enroll', requireAuth, async (req, res) => {
  try {
    const program = await WellnessProgram.findOne({ _id: req.params.id, isPublished: true });
    if (!program) return res.status(404).json({ error: 'Program not found.' });

    const existing = await ProgramEnrollment.findOne({ userId: req.user.id, programId: req.params.id });
    if (existing) return res.status(409).json({ error: 'Already enrolled.' });

    // Everything is free — no enrollment restrictions

    const enrollment = await ProgramEnrollment.create({
      userId: req.user.id,
      programId: req.params.id,
      currentDay: 1,
      completedDays: [],
    });

    await WellnessProgram.findByIdAndUpdate(req.params.id, { $inc: { enrollmentCount: 1 } });
    res.status(201).json({ ok: true, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /:id/progress  — mark a day complete */
router.patch('/:id/progress', requireAuth, async (req, res) => {
  try {
    const { dayNumber } = req.body;
    if (!dayNumber) return res.status(400).json({ error: 'dayNumber required.' });

    const enrollment = await ProgramEnrollment.findOne({ userId: req.user.id, programId: req.params.id });
    if (!enrollment) return res.status(404).json({ error: 'Not enrolled.' });
    if (enrollment.isCompleted) return res.json({ ok: true, enrollment });

    // Add day if not already completed
    if (!enrollment.completedDays.includes(dayNumber)) {
      enrollment.completedDays.push(dayNumber);
    }

    // Store the IST date string when this day was completed (for midnight gating)
    const nowIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // 'YYYY-MM-DD'
    enrollment.dayCompletedDates.set(String(dayNumber), new Date());

    // Advance current day
    if (dayNumber >= enrollment.currentDay) {
      enrollment.currentDay = dayNumber + 1;
    }

    // Check program completion
    const program = await WellnessProgram.findById(req.params.id).lean();
    if (program && enrollment.completedDays.length >= program.durationDays) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
    }

    enrollment.markModified('dayCompletedDates');
    await enrollment.save();

    // Return enrollment with dayCompletedDates as plain object
    const plain = enrollment.toObject();
    plain.dayCompletedDates = Object.fromEntries(enrollment.dayCompletedDates);
    res.json({ ok: true, enrollment: plain });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
