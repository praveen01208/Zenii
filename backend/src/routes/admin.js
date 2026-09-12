import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Story from '../models/Story.js';
import SiteSettings from '../models/SiteSettings.js';
import SupportTicket from '../models/SupportTicket.js';
import { TherapistTicket } from '../models/TherapistTicket.js';
import { TherapistReport } from '../models/TherapistReport.js';
import { Therapist } from '../models/Therapist.js';
import { cookieOpts } from '../utils/cookieOptions.js';
import CrisisLog from '../models/CrisisLog.js';

const router = Router();

// Admin cookie uses a different name but same options
const adminCookieOpts = { ...cookieOpts };

/* ── Middleware: require admin ── */
export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const admin = await Admin.findById(decoded.sub).lean();
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });

    req.admin = { id: String(admin._id) };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

/* ── POST /admin/login ── */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const admin = await Admin.findOne({ username }).lean();
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { sub: String(admin._id), role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('admin_token', token, adminCookieOpts);
  return res.json({ ok: true });
});

/* ── GET /admin/me ── */
router.get('/me', requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin.id).lean();
  return res.json({ ok: true, username: admin.username });
});

/* ── GET /admin/users ── */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    // Auto-unsuspend any users whose suspension period has expired
    await User.updateMany(
      { isSuspended: true, suspendedUntil: { $lte: new Date() } },
      { $set: { isSuspended: false, suspendedUntil: null } }
    );

    // Exclude avatar field to prevent huge payloads crashing the request
    const users = await User.find({}, '-passwordHash -avatar').sort({ createdAt: -1 }).lean();

    const totalUsers     = users.length;
    const suspendedCount = users.filter(u => u.isSuspended).length;

    // Determine start of day in UTC to match stored timestamps
    const utcStart = new Date();
    utcStart.setUTCHours(0, 0, 0, 0);
    // Use MongoDB aggregation for accurate count
    const todaysMembers = await User.countDocuments({ createdAt: { $gte: utcStart } });

    return res.json({
      ok: true,
      users,
      stats: {
        total: totalUsers,
        suspended: suspendedCount,
        today: todaysMembers,
        active: totalUsers - suspendedCount
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/* ── PUT /admin/users/:id/suspend ── */
// Body: { durationHours?: number }  — omit for permanent toggle
router.put('/users/:id/suspend', requireAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { durationHours } = req.body; // optional — hours until auto-unsuspend

  if (user.isSuspended && !durationHours) {
    // Toggle off (unsuspend)
    user.isSuspended   = false;
    user.suspendedUntil = null;
  } else {
    // Suspend
    user.isSuspended = true;
    if (durationHours && durationHours > 0) {
      user.suspendedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    } else {
      user.suspendedUntil = null; // permanent
    }
  }
  await user.save();
  return res.json({ ok: true, isSuspended: user.isSuspended, suspendedUntil: user.suspendedUntil });
});

/* ── DELETE /admin/users/:id ── */
router.delete('/users/:id', requireAdmin, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ ok: true });
});

/* ── POST /admin/logout ── */
router.post('/logout', (_req, res) => {
  res.clearCookie('admin_token', adminCookieOpts);
  return res.json({ ok: true });
});

/* ── PUT /admin/settings ── */
const settingsSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
});

router.put('/settings', requireAdmin, async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const admin = await Admin.findById(req.admin.id);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  if (parsed.data.username && parsed.data.username !== admin.username) {
    const existing = await Admin.findOne({ username: parsed.data.username });
    if (existing) return res.status(409).json({ error: 'Username already taken' });
    admin.username = parsed.data.username;
  }

  if (parsed.data.password) {
    admin.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  await admin.save();
  return res.json({ ok: true });
});

/* ── GET /admin/settings/site ── */
router.get('/settings/site', requireAdmin, async (req, res) => {
  const settings = await SiteSettings.findOne().lean();
  return res.json({ ok: true, settings: settings || {} });
});

/* ── PUT /admin/settings/site ── */
const siteSettingsSchema = z.object({
  activeUsers: z.string().optional(),
  satisfactionRate: z.string().optional(),
  therapistsCount: z.string().optional(),
  supportAvailable: z.string().optional(),
});

router.put('/settings/site', requireAdmin, async (req, res) => {
  const parsed = siteSettingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = new SiteSettings(parsed.data);
  } else {
    if (parsed.data.activeUsers !== undefined) settings.activeUsers = parsed.data.activeUsers;
    if (parsed.data.satisfactionRate !== undefined) settings.satisfactionRate = parsed.data.satisfactionRate;
    if (parsed.data.therapistsCount !== undefined) settings.therapistsCount = parsed.data.therapistsCount;
    if (parsed.data.supportAvailable !== undefined) settings.supportAvailable = parsed.data.supportAvailable;
  }
  await settings.save();
  return res.json({ ok: true, settings });
});

/* ── GET /admin/stories  (all stories including pending) ── */
router.get('/stories', requireAdmin, async (req, res) => {
  const { status } = req.query; // 'pending' | 'approved' | 'all'
  const query = {};
  if (status === 'pending')  query.isApproved = false;
  if (status === 'approved') query.isApproved = true;

  const stories = await Story.find(query).sort({ createdAt: -1 }).lean();
  const pendingCount  = await Story.countDocuments({ isApproved: false });
  const approvedCount = await Story.countDocuments({ isApproved: true });

  return res.json({ ok: true, stories, pendingCount, approvedCount });
});

/* ── PATCH /admin/stories/:id/approve  (approve or reject) ── */
router.patch('/stories/:id/approve', requireAdmin, async (req, res) => {
  const { approved } = req.body; // true = approve, false = reject (delete)
  if (typeof approved !== 'boolean') {
    return res.status(400).json({ error: 'approved (boolean) is required' });
  }

  const story = await Story.findById(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  if (approved) {
    story.isApproved = true;
    await story.save();
    return res.json({ ok: true, action: 'approved', story });
  } else {
    // Rejected = delete
    await Story.findByIdAndDelete(req.params.id);
    return res.json({ ok: true, action: 'rejected' });
  }
});

/* ── DELETE /admin/stories/:id ── */
router.delete('/stories/:id', requireAdmin, async (req, res) => {
  const story = await Story.findByIdAndDelete(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  return res.json({ ok: true });
});

/* ── POST /admin/stories/bulk-action ── */
router.post('/stories/bulk-action', requireAdmin, async (req, res) => {
  const { ids, action } = req.body; // action: 'approve' | 'delete'
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids required' });

  if (action === 'approve') {
    await Story.updateMany({ _id: { $in: ids } }, { $set: { isApproved: true } });
    return res.json({ ok: true, updated: ids.length });
  }
  if (action === 'delete') {
    await Story.deleteMany({ _id: { $in: ids } });
    return res.json({ ok: true, deleted: ids.length });
  }
  return res.status(400).json({ error: 'action must be approve or delete' });
});

/* ── THERAPIST MANAGEMENT ── */
import multer from 'multer';
import path from 'path';

// Multer storage config
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.get('/therapists', requireAdmin, async (req, res) => {
  try {
    const therapists = await Therapist.find({}, '-password').sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, therapists });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── GET /admin/therapists/:id  (full detail for admin verification) ── */
router.get('/therapists/:id', requireAdmin, async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id, '-password').lean();
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
    return res.json({ ok: true, therapist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/therapists', requireAdmin,
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 },
    { name: 'identityCardImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = req.body;
      const existing = await Therapist.findOne({ email: data.email });
      if (existing) return res.status(400).json({ error: 'Email already in use' });

      const therapist = new Therapist({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        specialization: data.specialization,
        experience: Number(data.experience) || 0,
        education: data.education,
        clinicAddress: data.clinicAddress,
        about: data.about || '',
        languages: data.languages ? data.languages.split(',').map((l) => l.trim()) : ['English', 'Hindi'],
        sessionTime: Number(data.sessionTime) || 30,
        sessionCost: Number(data.sessionCost) || 500,
        aadharNumber: data.aadharNumber || '',
        identityCardType: data.identityCardType || 'Aadhaar',
      });

      if (req.files?.['profilePicture']) {
        const file = req.files['profilePicture'][0];
        therapist.profilePicture = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
      if (req.files?.['licenseImage']) {
        const file = req.files['licenseImage'][0];
        therapist.licenseImage = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
      if (req.files?.['identityCardImage']) {
        const file = req.files['identityCardImage'][0];
        therapist.identityCardImage = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }

      await therapist.save();
      return res.json({ ok: true, therapist });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

router.put('/therapists/:id', requireAdmin,
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 },
    { name: 'identityCardImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = req.body;
      const therapist = await Therapist.findById(req.params.id);
      if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

      if (data.name) therapist.name = data.name;
      if (data.email && data.email !== therapist.email) {
        const existing = await Therapist.findOne({ email: data.email });
        if (existing) return res.status(400).json({ error: 'Email already in use' });
        therapist.email = data.email;
      }
      if (data.password) therapist.password = data.password;
      if (data.phone) therapist.phone = data.phone;
      if (data.specialization) therapist.specialization = data.specialization;
      if (data.experience) therapist.experience = Number(data.experience);
      if (data.education) therapist.education = data.education;
      if (data.clinicAddress) therapist.clinicAddress = data.clinicAddress;
      if (data.about !== undefined) therapist.about = data.about;
      if (data.languages) therapist.languages = data.languages.split(',').map((l) => l.trim());
      if (data.aadharNumber !== undefined) therapist.aadharNumber = data.aadharNumber;
      if (data.identityCardType) therapist.identityCardType = data.identityCardType;

      if (req.files?.['profilePicture']) {
        const file = req.files['profilePicture'][0];
        therapist.profilePicture = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
      if (req.files?.['licenseImage']) {
        const file = req.files['licenseImage'][0];
        therapist.licenseImage = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
      if (req.files?.['identityCardImage']) {
        const file = req.files['identityCardImage'][0];
        therapist.identityCardImage = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }

      await therapist.save();
      return res.json({ ok: true, therapist });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

router.put('/therapists/:id/suspend', requireAdmin, async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    therapist.isSuspended = !therapist.isSuspended;
    await therapist.save();
    return res.json({ ok: true, isSuspended: therapist.isSuspended });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/therapists/:id', requireAdmin, async (req, res) => {
  try {
    const therapist = await Therapist.findByIdAndDelete(req.params.id);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── SUPPORT MANAGEMENT ── */
router.get('/support', requireAdmin, async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, tickets });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/support/:id/resolve', requireAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    ticket.status = ticket.status === 'pending' ? 'resolved' : 'pending';
    await ticket.save();
    return res.json({ ok: true, status: ticket.status });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/support/bulk-delete', requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid ids array' });
    
    await SupportTicket.deleteMany({ _id: { $in: ids } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   THERAPIST SUPPORT DESK — Admin side
───────────────────────────────────────────────────────────────── */

/* GET /admin/therapist-tickets — list all tickets */
router.get('/therapist-tickets', requireAdmin, async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    const tickets = await TherapistTicket.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, tickets });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* PATCH /admin/therapist-tickets/:id — update status + reply */
router.patch('/therapist-tickets/:id', requireAdmin, async (req, res) => {
  try {
    const { status, adminReply, adminNote } = req.body;
    const ticket = await TherapistTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    if (status) ticket.status = status;
    if (adminReply !== undefined) ticket.adminReply = adminReply;
    if (adminNote !== undefined) ticket.adminNote = adminNote;
    await ticket.save();
    return res.json({ ok: true, ticket });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* POST /admin/therapist-tickets/bulk-delete */
router.post('/therapist-tickets/bulk-delete', requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid ids array' });
    
    await TherapistTicket.deleteMany({ _id: { $in: ids } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* PATCH /admin/therapist-tickets/:id/apply-profile — directly update therapist profile fields */
router.patch('/therapist-tickets/:id/apply-profile', requireAdmin, async (req, res) => {
  try {
    const ticket = await TherapistTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const { fields } = req.body; // { experience, specialization, bio, sessionCost, ... }
    if (!fields || typeof fields !== 'object') return res.status(400).json({ error: 'fields object required' });
    const allowed = ['name','experience','specialization','about','sessionCost','sessionTime','education','languages','clinicAddress','phone'];
    const update = {};
    for (const k of allowed) {
      if (fields[k] !== undefined) update[k] = fields[k];
    }
    await Therapist.findByIdAndUpdate(ticket.therapistId, { $set: update });
    ticket.status = 'resolved';
    ticket.adminReply = ticket.adminReply || 'Profile has been updated as requested.';
    await ticket.save();
    return res.json({ ok: true, ticket });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   THERAPIST INCIDENT REPORTS — Admin side
───────────────────────────────────────────────────────────────── */

/* GET /admin/therapist-reports — list all reports */
router.get('/therapist-reports', requireAdmin, async (req, res) => {
  try {
    const { status, urgency, reportType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (reportType) filter.reportType = reportType;
    const reports = await TherapistReport.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, reports });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* PATCH /admin/therapist-reports/:id — update status + notes */
router.patch('/therapist-reports/:id', requireAdmin, async (req, res) => {
  try {
    const { status, actionTaken, adminNote, therapistNote } = req.body;
    const report = await TherapistReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    if (status) report.status = status;
    if (actionTaken) report.actionTaken = actionTaken;
    if (adminNote !== undefined) report.adminNote = adminNote;
    if (therapistNote !== undefined) report.therapistNote = therapistNote;
    await report.save();
    return res.json({ ok: true, report });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* POST /admin/therapist-reports/bulk-delete */
router.post('/therapist-reports/bulk-delete', requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid ids array' });
    
    await TherapistReport.deleteMany({ _id: { $in: ids } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* POST /admin/therapist-reports/:id/suspend-user — suspend the involved user */
router.post('/therapist-reports/:id/suspend-user', requireAdmin, async (req, res) => {
  try {
    const { duration } = req.body; // '7d' | '30d' | 'permanent'
    const report = await TherapistReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (!report.involvedUserEmail) return res.status(400).json({ error: 'No user email in report' });

    const user = await User.findOne({ email: report.involvedUserEmail });
    if (!user) return res.status(404).json({ error: 'User not found with that email' });

    let suspendedUntil = null;
    let actionTaken = 'no_action';
    if (duration === '7d')  { suspendedUntil = new Date(Date.now() + 7 * 86400000); actionTaken = 'suspended_7d'; }
    else if (duration === '30d') { suspendedUntil = new Date(Date.now() + 30 * 86400000); actionTaken = 'suspended_30d'; }
    else if (duration === 'permanent') { suspendedUntil = new Date('2099-01-01'); actionTaken = 'suspended_perm'; }
    else return res.status(400).json({ error: 'Invalid duration. Use 7d, 30d or permanent' });

    user.isSuspended = true;
    user.suspendedUntil = suspendedUntil;
    await user.save();

    report.status = 'action_taken';
    report.actionTaken = actionTaken;
    report.therapistNote = report.therapistNote || `User has been suspended (${duration}).`;
    await report.save();

    return res.json({ ok: true, report, userEmail: user.email });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   CRISIS ANALYTICS — admin-only, fully anonymized (counts only, no PII)
───────────────────────────────────────────────────────────────── */

/**
 * ISO Week helper — returns e.g. "2026-W20" for the current or offset week.
 * offset = 0 → current week, offset = -1 → last week, etc.
 */
function getISOWeekString(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset * 7);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/**
 * GET /admin/analytics/crisis
 * Returns:
 *   - thisWeek: total crisis events this ISO week
 *   - lastWeek: total crisis events last ISO week
 *   - trend: 'up' | 'down' | 'same'
 *   - byCategory: breakdown of this week's events by phraseCategory
 *   - recentWeeks: last 8 weeks of counts for sparkline display
 */
router.get('/analytics/crisis', requireAdmin, async (req, res) => {
  try {
    const thisWeek = getISOWeekString(0);
    const lastWeek = getISOWeekString(-1);

    // Build last-8-weeks array (oldest → newest)
    const weeks = Array.from({ length: 8 }, (_, i) => getISOWeekString(i - 7));

    const [thisCount, lastCount, byCategory, weeklyRaw] = await Promise.all([
      CrisisLog.countDocuments({ isoWeek: thisWeek }),
      CrisisLog.countDocuments({ isoWeek: lastWeek }),
      CrisisLog.aggregate([
        { $match: { isoWeek: thisWeek } },
        { $group: { _id: '$phraseCategory', count: { $sum: 1 } } },
      ]),
      CrisisLog.aggregate([
        { $match: { isoWeek: { $in: weeks } } },
        { $group: { _id: '$isoWeek', count: { $sum: 1 } } },
      ]),
    ]);

    // Map weekly aggregation into ordered array
    const weekMap = Object.fromEntries(weeklyRaw.map(w => [w._id, w.count]));
    const recentWeeks = weeks.map(w => ({ week: w, count: weekMap[w] || 0 }));

    const trend = thisCount > lastCount ? 'up' : thisCount < lastCount ? 'down' : 'same';

    return res.json({
      ok: true,
      thisWeek,
      thisCount,
      lastCount,
      trend,
      byCategory: Object.fromEntries(byCategory.map(b => [b._id, b.count])),
      recentWeeks,
    });
  } catch (err) {
    console.error('[Admin] Crisis analytics error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   NOTIFICATION BROADCAST — admin sends to all users (or one)
───────────────────────────────────────────────────────────────── */
import Notification from '../models/Notification.js';

/**
 * POST /admin/notifications/broadcast
 * Body: { title, body, actionTab?, targetUserId? }
 *   - If targetUserId is set, send only to that user.
 *   - If omitted, send to all registered users (batched in 200s).
 */
router.post('/notifications/broadcast', requireAdmin, async (req, res) => {
  const { title, body, actionTab, targetUserId } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' });

  try {
    if (targetUserId) {
      // Single user
      await Notification.create({ userId: targetUserId, type: 'system', title, body, actionTab: actionTab || null });
      return res.json({ ok: true, sent: 1 });
    }

    // All users — paginate through in batches of 200 to avoid overwhelming the DB
    const users = await User.find({}, '_id').lean();
    const docs = users.map(u => ({
      userId: u._id,
      type: 'system',
      title,
      body,
      actionTab: actionTab || null,
      isRead: false,
    }));

    const BATCH = 200;
    let created = 0;
    for (let i = 0; i < docs.length; i += BATCH) {
      const result = await Notification.insertMany(docs.slice(i, i + BATCH), { ordered: false });
      created += result.length;
    }

    return res.json({ ok: true, sent: created });
  } catch (err) {
    console.error('[Admin] Broadcast error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/notifications/recent
 * Returns last 50 notifications across all users (for audit purposes).
 * Hides body text for privacy — only type, title, userId hash, timestamp.
 */
router.get('/notifications/recent', requireAdmin, async (req, res) => {
  try {
    const crypto = await import('crypto');
    const notifs = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const sanitized = notifs.map(n => ({
      _id: n._id,
      type: n.type,
      title: n.title,
      actionTab: n.actionTab,
      isRead: n.isRead,
      createdAt: n.createdAt,
      // Hash userId for audit display — never expose raw ID here
      userHash: crypto.createHash('sha256').update(String(n.userId)).digest('hex').slice(0, 12),
    }));

    return res.json({ ok: true, notifications: sanitized });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /admin/notifications/recent/:id
 * Delete a specific notification by ID
 */
router.delete('/notifications/recent/:id', requireAdmin, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

