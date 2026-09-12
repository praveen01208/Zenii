import express from 'express';
import TeamMember from '../models/TeamMember.js';
import { Job, JobApplication } from '../models/Job.js';
import { requireAdmin } from './admin.js';

const router = express.Router();

/* ══════════════════════════════════════════════════════════
   TEAM MEMBERS  (public GET, admin CRUD)
══════════════════════════════════════════════════════════ */

// Public: get all active team members
router.get('/team', async (_req, res) => {
  try {
    const members = await TeamMember.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ members });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: get all team members
router.get('/admin/team', requireAdmin, async (_req, res) => {
  try {
    const members = await TeamMember.find().sort({ order: 1, createdAt: 1 });
    res.json({ members });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: create team member
router.post('/admin/team', requireAdmin, async (req, res) => {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json({ member });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Admin: update team member
router.put('/admin/team/:id', requireAdmin, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ error: 'Not found' });
    res.json({ member });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Admin: delete team member
router.delete('/admin/team/:id', requireAdmin, async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ══════════════════════════════════════════════════════════
   JOBS  (public GET, admin CRUD)
══════════════════════════════════════════════════════════ */

// Public: get all active jobs
router.get('/jobs', async (req, res) => {
  try {
    const filter = { status: 'active' };
    if (req.query.department) filter.department = req.query.department;
    const jobs = await Job.find(filter)
      .select('-description -responsibilities -requirements -benefits')
      .sort({ featured: -1, postedDate: -1 });
    res.json({ jobs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public: get single job detail
router.get('/jobs/:slug', async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.slug, status: 'active' });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public: apply for a job
router.post('/jobs/:id/apply', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.status !== 'active') return res.status(404).json({ error: 'Job not found or closed' });
    const application = await JobApplication.create({ ...req.body, jobId: job._id, jobTitle: job.title });
    res.status(201).json({ ok: true, applicationId: application._id });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Admin: get all jobs
router.get('/admin/jobs', requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    const jobs = await Job.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json({ jobs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: create job
router.post('/admin/jobs', requireAdmin, async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json({ job });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Admin: update job
router.put('/admin/jobs/:id', requireAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ error: 'Not found' });
    res.json({ job });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Admin: delete job
router.delete('/admin/jobs/:id', requireAdmin, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    await JobApplication.deleteMany({ jobId: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: toggle job status
router.patch('/admin/jobs/:id/status', requireAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Not found' });
    job.status = job.status === 'active' ? 'closed' : 'active';
    await job.save();
    res.json({ status: job.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: get applications for a job
router.get('/admin/jobs/:id/applications', requireAdmin, async (req, res) => {
  try {
    const apps = await JobApplication.find({ jobId: req.params.id }).sort({ createdAt: -1 });
    res.json({ applications: apps });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: update application status
router.patch('/admin/applications/:id/status', requireAdmin, async (req, res) => {
  try {
    const app = await JobApplication.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ application: app });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Admin: GET ALL applications across all jobs (with optional filters)
router.get('/admin/applications', requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.jobId) filter.jobId = req.query.jobId;

    const applications = await JobApplication.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Stats
    const total      = await JobApplication.countDocuments();
    const newCount   = await JobApplication.countDocuments({ status: 'new' });
    const shortlisted = await JobApplication.countDocuments({ status: 'shortlisted' });
    const rejected   = await JobApplication.countDocuments({ status: 'rejected' });

    res.json({ applications, stats: { total, new: newCount, shortlisted, rejected } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: delete a single application
router.delete('/admin/applications/:id', requireAdmin, async (req, res) => {
  try {
    await JobApplication.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
