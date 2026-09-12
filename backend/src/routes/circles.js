import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from './admin.js';
import { Circle, CircleMessage, CircleMember } from '../models/Circle.js';

const router = Router();

/* ══════════════════════════════════════════════════════════════
   USER ROUTES
══════════════════════════════════════════════════════════════ */

/* GET /api/circles — list all active circles with membership flag */
router.get('/', requireAuth, async (req, res) => {
  try {
    const circles = await Circle.find({ isActive: true }).sort({ memberCount: -1 }).lean();

    // Check which ones the current user has joined
    const memberships = await CircleMember.find({ userId: req.user.id })
      .select('circleId').lean();
    const joinedSet = new Set(memberships.map(m => String(m.circleId)));

    const result = circles.map(c => ({
      ...c,
      isJoined: joinedSet.has(String(c._id)),
    }));

    res.json({ ok: true, circles: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch circles.' });
  }
});

/* POST /api/circles/:id/join — join or leave a circle */
router.post('/:id/join', requireAuth, async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle || !circle.isActive) return res.status(404).json({ error: 'Circle not found.' });

    const existing = await CircleMember.findOne({ circleId: circle._id, userId: req.user.id });

    if (existing) {
      // Leave
      await CircleMember.deleteOne({ _id: existing._id });
      await Circle.findByIdAndUpdate(circle._id, { $inc: { memberCount: -1 } });
      return res.json({ ok: true, joined: false });
    } else {
      // Check limits before joining
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      // Everything is free — no join limits

      // Join
      await CircleMember.create({ circleId: circle._id, userId: req.user.id });
      await Circle.findByIdAndUpdate(circle._id, { $inc: { memberCount: 1 } });
      return res.json({ ok: true, joined: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update membership.' });
  }
});

/* GET /api/circles/:id/messages — paginated message history */
router.get('/:id/messages', requireAuth, async (req, res) => {
  try {
    const limit  = Math.min(50, Number(req.query.limit) || 50);
    const before = req.query.before ? new Date(req.query.before) : new Date();

    const messages = await CircleMessage.find({
      circleId:  req.params.id,
      isDeleted: false,
      createdAt: { $lt: before },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ ok: true, messages: messages.reverse() }); // oldest-first for UI
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

/* POST /api/circles/:id/messages — post a new message (REST + triggers socket via response) */
router.post('/:id/messages', requireAuth, async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;
    if (!content?.trim() || content.trim().length < 1)
      return res.status(400).json({ error: 'Message cannot be empty.' });
    if (content.trim().length > 1000)
      return res.status(400).json({ error: 'Message too long (max 1000 chars).' });

    const circle = await Circle.findById(req.params.id);
    if (!circle || !circle.isActive) return res.status(404).json({ error: 'Circle not found.' });

    // Import User dynamically to get name
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.id).select('name').lean();
    const authorName = isAnonymous ? 'Anonymous' : (user?.name || 'ZenMind User');

    const message = await CircleMessage.create({
      circleId:   circle._id,
      userId:     req.user.id,
      authorName,
      content:    content.trim(),
      isAnonymous: !!isAnonymous,
    });

    // Increment message count
    await Circle.findByIdAndUpdate(circle._id, { $inc: { messageCount: 1 } });

    res.status(201).json({ ok: true, message });
  } catch (err) {
    console.error('[Circles] message post error:', err.message);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   ADMIN ROUTES
══════════════════════════════════════════════════════════════ */

/* GET /api/circles/admin/list */
router.get('/admin/list', requireAdmin, async (req, res) => {
  try {
    const circles = await Circle.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, circles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch circles.' });
  }
});

/* POST /api/circles/admin — create circle */
router.post('/admin', requireAdmin, async (req, res) => {
  try {
    const { name, description, category, icon, gradientFrom, gradientTo } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });

    const circle = await Circle.create({
      name: name.trim(),
      description: description?.trim() || '',
      category: category || 'general',
      icon: icon || '💬',
      gradientFrom: gradientFrom || '#0d5d3a',
      gradientTo:   gradientTo   || '#1a8a5a',
    });
    res.status(201).json({ ok: true, circle });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create circle.' });
  }
});

/* PUT /api/circles/admin/:id */
router.put('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) return res.status(404).json({ error: 'Circle not found.' });

    const fields = ['name', 'description', 'category', 'icon', 'isActive', 'gradientFrom', 'gradientTo'];
    fields.forEach(f => { if (req.body[f] !== undefined) circle[f] = req.body[f]; });
    await circle.save();
    res.json({ ok: true, circle });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update circle.' });
  }
});

/* DELETE /api/circles/admin/:id */
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    await Circle.findByIdAndDelete(req.params.id);
    await CircleMessage.deleteMany({ circleId: req.params.id });
    await CircleMember.deleteMany({ circleId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete circle.' });
  }
});

/* DELETE /api/circles/admin/messages/:msgId — admin moderate a message */
router.delete('/admin/messages/:msgId', requireAdmin, async (req, res) => {
  try {
    await CircleMessage.findByIdAndUpdate(req.params.msgId, { isDeleted: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

/* GET /api/circles/admin/:id/messages — admin view messages (fixes 401) */
router.get('/admin/:id/messages', requireAdmin, async (req, res) => {
  try {
    const limit  = Math.min(100, Number(req.query.limit) || 50);
    const messages = await CircleMessage.find({
      circleId:  req.params.id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ ok: true, messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

/* DELETE /api/circles/admin/members/:userId/circle/:circleId — remove user from a circle */
router.delete('/admin/members/:userId/circle/:circleId', requireAdmin, async (req, res) => {
  try {
    await CircleMember.deleteOne({ userId: req.params.userId, circleId: req.params.circleId });
    await Circle.findByIdAndUpdate(req.params.circleId, { $inc: { memberCount: -1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member.' });
  }
});

/* GET /api/circles/admin/flagged — all non-deleted messages (admin scans for bad words client-side) */
router.get('/admin/flagged', requireAdmin, async (req, res) => {
  try {
    const messages = await CircleMessage.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    // Attach circle info
    const circleIds = [...new Set(messages.map(m => String(m.circleId)))];
    const circles   = await Circle.find({ _id: { $in: circleIds } }).select('name icon').lean();
    const circleMap = Object.fromEntries(circles.map(c => [String(c._id), c]));

    const enriched = messages.map(m => ({
      ...m,
      circleName: circleMap[String(m.circleId)]?.name || 'Unknown',
      circleIcon: circleMap[String(m.circleId)]?.icon || '💬',
    }));

    res.json({ ok: true, messages: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

export default router;
