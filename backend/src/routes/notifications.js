import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = Router();

// All routes require an authenticated user
router.use(requireAuth);

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/notifications?page=1&limit=20&unreadOnly=false
   Returns paginated notifications for the current user.
   Also returns unreadCount so the bell badge can be kept up-to-date.
───────────────────────────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const page       = Math.max(1, parseInt(req.query.page)  || 1);
    const limit      = Math.min(50, parseInt(req.query.limit) || 20);
    const unreadOnly = req.query.unreadOnly === 'true';
    const skip       = (page - 1) * limit;

    const filter = { userId: req.user.id, ...(unreadOnly ? { isRead: false } : {}) };

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    return res.json({
      ok: true,
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/notifications/unread-count
   Lightweight poll endpoint — only returns { unreadCount }.
   Used by the bell badge poller (every 30 s).
───────────────────────────────────────────────────────────────────────────── */
router.get('/unread-count', async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    return res.json({ ok: true, unreadCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/notifications/:id/read
   Mark a single notification as read.
───────────────────────────────────────────────────────────────────────────── */
router.patch('/:id/read', async (req, res) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, userId: req.user.id },
      { $set: { isRead: true } }
    );
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    return res.json({ ok: true, unreadCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/notifications/read-all
   Mark all of the user's notifications as read.
───────────────────────────────────────────────────────────────────────────── */
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { $set: { isRead: true } });
    return res.json({ ok: true, unreadCount: 0 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/notifications/:id
   Delete a single notification.
───────────────────────────────────────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, userId: req.user.id });
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    return res.json({ ok: true, unreadCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/notifications/clear-all
   Delete ALL notifications for the current user.
───────────────────────────────────────────────────────────────────────────── */
router.delete('/clear-all', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    return res.json({ ok: true, unreadCount: 0 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/notifications/internal/send
   Internal helper — allows other backend routes to push a notification to a
   user without importing the model directly.

   Body: { userId, type, title, body, actionTab?, dedupeKey? }
   This endpoint is NOT exposed externally (protected only by requireAuth to a
   valid logged-in user for testing purposes; in production you'd want a server-
   to-server secret, but for this stack a simple helper export is enough).
───────────────────────────────────────────────────────────────────────────── */
router.post('/internal/send', async (req, res) => {
  try {
    const { userId, type, title, body, actionTab, dedupeKey } = req.body;

    // If a dedupeKey is provided, don't create duplicates
    if (dedupeKey) {
      const exists = await Notification.exists({ userId, dedupeKey });
      if (exists) return res.json({ ok: true, skipped: true });
    }

    const notif = await Notification.create({ userId, type, title, body, actionTab: actionTab || null, dedupeKey: dedupeKey || undefined });
    return res.status(201).json({ ok: true, notification: notif });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

/* ─────────────────────────────────────────────────────────────────────────────
   UTILITY EXPORT — call this from any other route to push a notification.
   Usage: import { pushNotification } from './notifications.js';
           await pushNotification({ userId, type, title, body, actionTab });
───────────────────────────────────────────────────────────────────────────── */
export async function pushNotification({ userId, type, title, body, actionTab = null, dedupeKey }) {
  try {
    if (dedupeKey) {
      const exists = await Notification.exists({ userId, dedupeKey });
      if (exists) return null;
    }
    return await Notification.create({ userId, type, title, body, actionTab, dedupeKey: dedupeKey || undefined });
  } catch (err) {
    console.error('[Notification] pushNotification error:', err.message);
    return null;
  }
}
