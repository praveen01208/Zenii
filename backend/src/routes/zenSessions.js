import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import ZenSession from '../models/ZenSession.js';
import ZenMessage from '../models/ZenMessage.js';

const router = Router();
router.use(requireAuth);

// ── GET /api/zen-sessions
// List all sessions for the current user (sidebar data), newest first
router.get('/', async (req, res) => {
  try {
    const sessions = await ZenSession
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('title category messageCount moodScore createdAt updatedAt');
    res.json({ sessions });
  } catch (err) {
    console.error('[ZenSessions] list error:', err.message);
    res.status(500).json({ error: 'Failed to load sessions' });
  }
});

// ── GET /api/zen-sessions/:id/messages
// Load messages for a specific session (restore a past chat)
// Returns last 60 messages; client can request older ones with ?before=<timestamp>
router.get('/:id/messages', async (req, res) => {
  try {
    const session = await ZenSession.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const before = req.query.before ? new Date(req.query.before) : new Date();
    const messages = await ZenMessage
      .find({ sessionId: session._id, createdAt: { $lt: before } })
      .sort({ createdAt: 1 })
      .limit(60)
      .select('role content action createdAt');

    res.json({ messages, sessionId: session._id, title: session.title, category: session.category });
  } catch (err) {
    console.error('[ZenSessions] messages error:', err.message);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// ── PATCH /api/zen-sessions/:id
// Update session title or category
router.patch('/:id', async (req, res) => {
  try {
    const { title, category } = req.body;
    const update = {};
    if (title)    update.title    = String(title).slice(0, 80);
    if (category) update.category = category;

    const session = await ZenSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: update },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// ── PATCH /api/zen-sessions/:id/mood
// Save a passive mood score (from "Feeling good 😊" button = 8)
// or an active daily slider score (1-10)
router.patch('/:id/mood', async (req, res) => {
  try {
    const score = Number(req.body.score);
    if (!score || score < 1 || score > 10) {
      return res.status(400).json({ error: 'score must be 1-10' });
    }
    const session = await ZenSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { moodScore: score } },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ ok: true, moodScore: session.moodScore });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save mood score' });
  }
});

// ── DELETE /api/zen-sessions/:id
// Delete a session and all its messages
router.delete('/:id', async (req, res) => {
  try {
    const session = await ZenSession.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    // Delete all messages for this session
    await ZenMessage.deleteMany({ sessionId: session._id });
    res.json({ ok: true });
  } catch (err) {
    console.error('[ZenSessions] delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
