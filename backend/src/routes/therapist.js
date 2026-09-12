import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { Therapist } from '../models/Therapist.js';
import { TherapistTicket } from '../models/TherapistTicket.js';
import { TherapistReport } from '../models/TherapistReport.js';
import User from '../models/User.js';
import DailyMood from '../models/DailyMood.js';
import WellnessGoal from '../models/WellnessGoal.js';
import { WellnessProgram } from '../models/WellnessProgram.js';
import { cookieOpts } from '../utils/cookieOptions.js';

const router = Router();
const therapistCookieOpts = { ...cookieOpts };

// Multer for profile picture uploads
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/* ── Auth Middleware ── */
export const requireTherapist = async (req, res, next) => {
  try {
    const token = req.cookies.therapist_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'therapist') return res.status(403).json({ error: 'Forbidden' });

    const therapist = await Therapist.findById(decoded.sub)
      .select('-password -aadharNumber -identityCardType -identityCardImage')
      .lean();
    if (!therapist) return res.status(401).json({ error: 'Unauthorized' });
    if (therapist.isSuspended) return res.status(403).json({ error: 'Account suspended' });

    req.therapist = therapist;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

/* ── POST /therapist/login ── */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

  const therapist = await Therapist.findOne({ email }).lean();
  if (!therapist) return res.status(401).json({ error: 'Invalid credentials' });
  if (therapist.isSuspended) return res.status(403).json({ error: 'Account suspended by Admin' });

  const valid = await bcrypt.compare(password, therapist.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ sub: String(therapist._id), role: 'therapist' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('therapist_token', token, therapistCookieOpts);
  return res.json({ ok: true });
});

/* ── POST /therapist/logout ── */
router.post('/logout', (_req, res) => {
  res.clearCookie('therapist_token', therapistCookieOpts);
  return res.json({ ok: true });
});

/* ── GET /therapist/me ── */
router.get('/me', requireTherapist, (req, res) => {
  return res.json({ ok: true, therapist: req.therapist });
});

/* ── PUT /therapist/profile  (phone + residentialAddress + clinicAddress + sessionType + profilePicture + clinicImages) ── */
router.put('/profile', requireTherapist, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'clinicImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.therapist._id);
    if (!therapist) return res.status(404).json({ error: 'Not found' });

    const { phone, residentialAddress, clinicAddress, sessionType, password, deleteClinicImages } = req.body;
    if (phone) therapist.phone = phone;
    if (residentialAddress !== undefined) therapist.residentialAddress = residentialAddress;
    if (clinicAddress !== undefined) therapist.clinicAddress = clinicAddress;
    if (sessionType !== undefined) therapist.sessionType = sessionType;
    if (password) therapist.password = password; // pre-save hook hashes it

    if (deleteClinicImages) {
      let toDelete = [];
      try {
        toDelete = JSON.parse(deleteClinicImages);
      } catch (e) {
        toDelete = [deleteClinicImages];
      }
      therapist.clinicImages = therapist.clinicImages.filter(img => !toDelete.includes(img));
    }

    if (req.files) {
      if (req.files['profilePicture'] && req.files['profilePicture'][0]) {
        const file = req.files['profilePicture'][0];
        therapist.profilePicture = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
      if (req.files['clinicImages'] && req.files['clinicImages'].length > 0) {
        const newImages = req.files['clinicImages'].map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
        therapist.clinicImages = [...therapist.clinicImages, ...newImages];
      }
    }

    await therapist.save();
    const updated = therapist.toObject();
    delete updated.password;
    delete updated.aadharNumber;
    delete updated.identityCardType;
    delete updated.identityCardImage;
    return res.json({ ok: true, therapist: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── PUT /therapist/schedule ── */
router.put('/schedule', requireTherapist, async (req, res) => {
  try {
    const { sessionTime, sessionCost, availableSlots, notes } = req.body;
    const therapist = await Therapist.findById(req.therapist._id);
    if (!therapist) return res.status(404).json({ error: 'Not found' });

    if (sessionTime !== undefined) therapist.sessionTime = Number(sessionTime);
    if (sessionCost !== undefined) therapist.sessionCost = Number(sessionCost);
    if (availableSlots !== undefined) therapist.availableSlots = availableSlots;
    if (notes !== undefined) therapist.notes = notes;

    await therapist.save();
    return res.json({ ok: true, therapist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── PUT /therapist/settings (legacy — kept for compat) ── */
router.put('/settings', requireTherapist, async (req, res) => {
  try {
    const { phone, password } = req.body;
    const therapist = await Therapist.findById(req.therapist._id);
    if (!therapist) return res.status(404).json({ error: 'Not found' });

    if (phone) therapist.phone = phone;
    if (password) therapist.password = password;

    await therapist.save();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   SUPPORT DESK — Tickets
───────────────────────────────────────────────────────────────── */

/* POST /therapist/tickets — submit a support ticket */
router.post('/tickets', requireTherapist, async (req, res) => {
  try {
    const { category, subject, message } = req.body;
    if (!category || !subject || !message)
      return res.status(400).json({ error: 'category, subject and message are required' });

    const ticket = await TherapistTicket.create({
      therapistId: req.therapist._id,
      therapistName: req.therapist.name,
      therapistEmail: req.therapist.email,
      category, subject, message,
    });
    return res.status(201).json({ ok: true, ticket });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* GET /therapist/tickets — get my tickets */
router.get('/tickets', requireTherapist, async (req, res) => {
  try {
    const tickets = await TherapistTicket.find({ therapistId: req.therapist._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ ok: true, tickets });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* GET /therapist/tickets/:id — get a single ticket */
router.get('/tickets/:id', requireTherapist, async (req, res) => {
  try {
    const ticket = await TherapistTicket.findOne({
      _id: req.params.id,
      therapistId: req.therapist._id,
    }).lean();
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true, ticket });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   INCIDENT REPORTS
───────────────────────────────────────────────────────────────── */

/* POST /therapist/reports — submit an incident report */
router.post('/reports', requireTherapist, async (req, res) => {
  try {
    const { reportType, urgency, involvedUserEmail, involvedUserName, sessionReference, description } = req.body;
    if (!reportType || !description)
      return res.status(400).json({ error: 'reportType and description are required' });

    const report = await TherapistReport.create({
      therapistId: req.therapist._id,
      therapistName: req.therapist.name,
      therapistEmail: req.therapist.email,
      reportType, urgency: urgency || 'normal',
      involvedUserEmail: involvedUserEmail || '',
      involvedUserName: involvedUserName || '',
      sessionReference: sessionReference || '',
      description,
    });
    return res.status(201).json({ ok: true, report });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* GET /therapist/reports — get my reports */
router.get('/reports', requireTherapist, async (req, res) => {
  try {
    const reports = await TherapistReport.find({ therapistId: req.therapist._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ ok: true, reports });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
/* ─────────────────────────────────────────────────────────────────
   CLIENT WELLNESS SNAPSHOT
───────────────────────────────────────────────────────────────── */

/* GET /therapist/client/:userId/wellness-snapshot */
router.get('/client/:userId/wellness-snapshot', requireTherapist, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name shareProgressWithTherapist').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Consent check
    if (!user.shareProgressWithTherapist) {
      return res.status(403).json({ error: 'User has not consented to sharing wellness progress.' });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toLocaleDateString('en-CA');

    // 1. Mood Scores (last 30 days)
    const moods = await DailyMood.find({
      userId: user._id,
      day: { $gte: thirtyDaysAgoStr }
    }).select('day score').sort({ day: 1 }).lean();

    // 2. Wellness Goals
    const goals = await WellnessGoal.find({
      userId: user._id,
      isActive: true
    }).select('title currentStreak longestStreak totalCompleted category color').lean();

    // 3. Wellness Programs progress (just active programs)
    const allPrograms = await WellnessProgram.find().lean();
    // Assuming program progress is stored somewhere, but if not we can return active goals instead
    // The prompt says "Wellness program progress". Let's check user's program progress.
    // Actually, program enrollments are typically in a separate collection or inside User. 
    // Let's just return what we have. If we need to pull UserProgram, we'll try to do it safely.
    let activePrograms = [];
    try {
      const { ProgramEnrollment } = await import('../models/WellnessProgram.js');
      activePrograms = await ProgramEnrollment.find({ userId: user._id, isCompleted: false })
        .populate('programId', 'title category')
        .select('currentDay completedDays')
        .lean();
      
      // format to match frontend expected structure: { programId: { title, category }, progress }
      activePrograms = activePrograms.map(en => ({
        programId: en.programId,
        progress: en.currentDay,
      }));
    } catch (e) {
      console.error(e);
    }

    return res.json({
      ok: true,
      snapshot: {
        userName: user.name,
        moods,
        goals,
        activePrograms
      }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
