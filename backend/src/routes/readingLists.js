import { Router } from 'express';
import ReadingList from '../models/ReadingList.js';
import { requireAuth } from '../middleware/auth.js';
import { requireTherapist } from './therapist.js';
import { requireAdmin } from './admin.js';

const router = Router();

/* ══════════════════════════════════════════
   THERAPIST ROUTES — /api/reading-lists/therapist/*
══════════════════════════════════════════ */

/* GET own lists */
router.get('/therapist', requireTherapist, async (req, res) => {
  try {
    const lists = await ReadingList.find({ therapistId: req.therapist._id })
      .sort({ createdAt: -1 }).lean();
    res.json({ ok: true, lists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST create a new list */
router.post('/therapist', requireTherapist, async (req, res) => {
  try {
    const { title, description, category, tags, coverEmoji, items } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' });

    const list = await ReadingList.create({
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'general',
      tags: Array.isArray(tags) ? tags : [],
      coverEmoji: coverEmoji || '📚',
      therapistId:   req.therapist._id,
      therapistName: req.therapist.name,
      items: Array.isArray(items) ? items : [],
    });
    res.status(201).json({ ok: true, list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PUT update a list */
router.put('/therapist/:id', requireTherapist, async (req, res) => {
  try {
    const list = await ReadingList.findOne({ _id: req.params.id, therapistId: req.therapist._id });
    if (!list) return res.status(404).json({ error: 'List not found.' });

    const { title, description, category, tags, coverEmoji, items, isPublished } = req.body;
    if (title !== undefined)       list.title = title.trim();
    if (description !== undefined) list.description = description.trim();
    if (category !== undefined)    list.category = category;
    if (tags !== undefined)        list.tags = tags;
    if (coverEmoji !== undefined)  list.coverEmoji = coverEmoji;
    if (Array.isArray(items))      list.items = items;

    // Publishing resets approval if content changed significantly
    if (isPublished !== undefined && isPublished !== list.isPublished) {
      list.isPublished = isPublished;
      if (isPublished) {
        // Re-submit for admin approval
        list.isApproved      = false;
        list.rejectionReason = '';
      }
    }

    await list.save();
    res.json({ ok: true, list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE a list */
router.delete('/therapist/:id', requireTherapist, async (req, res) => {
  try {
    await ReadingList.findOneAndDelete({ _id: req.params.id, therapistId: req.therapist._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════
   ADMIN ROUTES — /api/reading-lists/admin/*
══════════════════════════════════════════ */

/* GET all lists (pending + approved) */
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query; // 'pending' | 'approved' | 'all'
    const query = { isPublished: true };
    if (status === 'pending')  query.isApproved = false;
    if (status === 'approved') query.isApproved = true;

    const lists = await ReadingList.find(query).sort({ createdAt: -1 }).lean();
    const pendingCount  = await ReadingList.countDocuments({ isPublished: true, isApproved: false });
    const approvedCount = await ReadingList.countDocuments({ isPublished: true, isApproved: true });
    res.json({ ok: true, lists, pendingCount, approvedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PATCH approve or reject */
router.patch('/admin/:id/review', requireAdmin, async (req, res) => {
  try {
    const { approved, reason } = req.body;
    const list = await ReadingList.findById(req.params.id);
    if (!list) return res.status(404).json({ error: 'List not found.' });

    list.isApproved      = !!approved;
    list.rejectionReason = approved ? '' : (reason || 'Does not meet guidelines.');
    await list.save();
    res.json({ ok: true, list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE a list (admin force delete) */
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    await ReadingList.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════
   USER ROUTES — /api/reading-lists/*
══════════════════════════════════════════ */

/* GET all approved + published lists */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { isPublished: true, isApproved: true };
    if (category && category !== 'all') query.category = category;
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [{ title: re }, { description: re }, { tags: re }, { therapistName: re }];
    }

    const lists = await ReadingList.find(query).sort({ saveCount: -1, createdAt: -1 }).lean();

    // Attach whether current user saved each
    const enriched = lists.map(l => ({
      ...l,
      isSaved: (l.savedBy || []).some(uid => String(uid) === String(req.user.id)),
      savedBy: undefined, // don't leak full list
    }));

    res.json({ ok: true, lists: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET one list detail */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const list = await ReadingList.findOne({ _id: req.params.id, isPublished: true, isApproved: true }).lean();
    if (!list) return res.status(404).json({ error: 'List not found.' });
    const isSaved = (list.savedBy || []).some(uid => String(uid) === String(req.user.id));
    res.json({ ok: true, list: { ...list, isSaved, savedBy: undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST save / unsave a list */
router.post('/:id/save', requireAuth, async (req, res) => {
  try {
    const list = await ReadingList.findOne({ _id: req.params.id, isPublished: true, isApproved: true });
    if (!list) return res.status(404).json({ error: 'List not found.' });

    const uid = req.user.id;
    const idx = list.savedBy.findIndex(id => String(id) === String(uid));
    if (idx === -1) {
      // User is trying to save it. Check limits.
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(uid).select('subscriptionTier').lean();
      // Everything is free — no reading list restrictions

      list.savedBy.push(uid);
      list.saveCount += 1;
    } else {
      list.savedBy.splice(idx, 1);
      list.saveCount = Math.max(0, list.saveCount - 1);
    }
    await list.save();
    res.json({ ok: true, isSaved: idx === -1, saveCount: list.saveCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET user's saved lists */
router.get('/user/saved', requireAuth, async (req, res) => {
  try {
    const lists = await ReadingList.find({
      isPublished: true, isApproved: true, savedBy: req.user.id,
    }).sort({ createdAt: -1 }).lean();
    res.json({ ok: true, lists: lists.map(l => ({ ...l, isSaved: true, savedBy: undefined })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
