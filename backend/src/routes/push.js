import { Router } from 'express';
import webpush from 'web-push';
import { requireAuth } from '../middleware/auth.js';
import PushSubscription from '../models/PushSubscription.js';
import WellnessGoal from '../models/WellnessGoal.js';

const router = Router();

/* ── VAPID setup ── */
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_CONTACT = process.env.VAPID_CONTACT || 'mailto:admin@zenmind.app';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC, VAPID_PRIVATE);
  console.log('[Push] VAPID configured ✅');
} else {
  console.warn('[Push] ⚠️  VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — browser push disabled.');
  console.warn('[Push] Run: node -e "const wp=require(\'web-push\');console.log(JSON.stringify(wp.generateVAPIDKeys()))"');
}

/* ── GET /api/push/vapid-public — send public key to frontend ── */
router.get('/vapid-public', (req, res) => {
  if (!VAPID_PUBLIC) return res.json({ ok: false, key: null });
  res.json({ ok: true, key: VAPID_PUBLIC });
});

/* ── POST /api/push/subscribe ── */
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth)
      return res.status(400).json({ error: 'Invalid subscription object.' });

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userId: req.user.id, endpoint, keys },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save subscription.' });
  }
});

/* ── DELETE /api/push/unsubscribe ── */
router.delete('/unsubscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.deleteOne({ userId: req.user.id, endpoint });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove subscription.' });
  }
});

/* ── POST /api/push/nudge — send a streak nudge to the requesting user ── */
router.post('/nudge', requireAuth, async (req, res) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(503).json({ error: 'Push notifications not configured on this server.' });
  }

  try {
    const subs = await PushSubscription.find({ userId: req.user.id }).lean();
    if (!subs.length) return res.status(404).json({ error: 'No push subscriptions found.' });

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const goals = await WellnessGoal.find({ userId: req.user.id, isArchived: false }).lean();
    const undone = goals.filter(g => !g.completions.some(c => c.date === today));

    const title = undone.length > 0
      ? `Don\u2019t break your streak! \uD83D\uDD25`
      : `All goals done today! \uD83C\uDF89`;
    const body = undone.length > 0
      ? `${undone.length} wellness goal${undone.length > 1 ? 's' : ''} still pending: ${undone.slice(0,2).map(g => g.title).join(', ')}`
      : `You completed all your wellness goals today. Amazing work!`;

    const payload = JSON.stringify({ title, body, icon: '/logo192.png', url: '/' });

    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        ).catch(async err => {
          // Remove expired subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.deleteOne({ endpoint: sub.endpoint });
          }
          throw err;
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    res.json({ ok: true, sent, total: subs.length });
  } catch (err) {
    console.error('[Push] nudge error:', err.message);
    res.status(500).json({ error: 'Failed to send push.' });
  }
});

export default router;
