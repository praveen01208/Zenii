import { Router } from 'express';
import { z } from 'zod';

import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { cookieOpts } from '../utils/cookieOptions.js';

const router = Router();

/* ── GET /me ── */
router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({
    id:             String(user._id),
    name:           user.name,
    email:          user.email,
    phone:          user.phone,
    age:            user.age,
    gender:         user.gender,
    avatar:         user.avatar?.data ? { mime: user.avatar.mime, data: user.avatar.data } : null,
    onboardingDone: user.onboardingDone ?? false,
    shareProgressWithTherapist: user.shareProgressWithTherapist ?? false,
    subscriptionTier: user.subscriptionTier || 'free',
    aiCreditsRemaining: user.aiWeeklyCredits || 0,
    freeTherapyQuota: user.freeTherapyQuota || 0,
  });
});

/* ── PUT /me ── */
const updateSchema = z.object({
  name:   z.string().min(2).optional(),
  phone:  z.string().min(8).optional(),
  age:    z.coerce.number().int().min(1).max(120).optional(),
  email:  z.string().email().optional(),
  gender: z.enum(['male', 'female', 'other']).optional()
});

router.put('/', requireAuth, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Uniqueness check for phone
  if (parsed.data.phone && parsed.data.phone !== user.phone) {
    const phoneExists = await User.findOne({
      phone: parsed.data.phone,
      _id: { $ne: user._id }
    }).lean();
    if (phoneExists) return res.status(409).json({ error: 'This mobile number is already in use.' });
    user.phone = parsed.data.phone;
  }

  // Uniqueness check for email
  if (parsed.data.email && parsed.data.email.toLowerCase() !== user.email) {
    const emailExists = await User.findOne({
      email: parsed.data.email.toLowerCase(),
      _id: { $ne: user._id }
    }).lean();
    if (emailExists) return res.status(409).json({ error: 'User with this email exists, you cannot use this email.' });
    user.email = parsed.data.email.toLowerCase();
  }

  if (parsed.data.name)              user.name = parsed.data.name;
  if (parsed.data.age !== undefined) user.age  = parsed.data.age;
  if (parsed.data.gender)            user.gender = parsed.data.gender;

  await user.save();

  // Return the full updated user object (fixes frontend setMe(updated))
  return res.json({
    id:     String(user._id),
    name:   user.name,
    email:  user.email,
    phone:  user.phone,
    age:    user.age,
    gender: user.gender,
    avatar: user.avatar?.data ? { mime: user.avatar.mime, data: user.avatar.data } : null,
    subscriptionTier: user.subscriptionTier || 'free',
    aiCreditsRemaining: user.aiWeeklyCredits || 0,
    freeTherapyQuota: user.freeTherapyQuota || 0,
  });
});

/* ── PUT /me/avatar ── */
const avatarSchema = z.object({
  mime: z.string().min(3),
  data: z.string().min(10)
});

router.put('/avatar', requireAuth, async (req, res) => {
  const parsed = avatarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  user.avatar = { mime: parsed.data.mime, data: parsed.data.data };
  await user.save();
  return res.json({ ok: true });
});

/* ── POST /me/onboarding  — save completion state ── */
router.post('/onboarding', requireAuth, async (req, res) => {
  try {
    const { goals, currentMood, stressLevel } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    user.onboardingDone = true;
    user.onboardingData = {
      goals:       Array.isArray(goals) ? goals.slice(0, 10) : [],
      currentMood: typeof currentMood === 'number' ? Math.min(5, Math.max(1, currentMood)) : null,
      stressLevel: typeof stressLevel === 'number' ? Math.min(5, Math.max(1, stressLevel)) : null,
      completedAt: new Date(),
    };
    await user.save();

    // Fire-and-forget: send a welcome notification
    try {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.create({
        userId: user._id,
        type: 'system',
        title: `Welcome to ZenMind, ${user.name.split(' ')[0]}! 🌿`,
        body: 'Your personalised wellness journey starts now. Explore AI Chat, book a therapist, or set your first wellness goal!',
        actionTab: 'aichat',
      });
    } catch { /* non-critical */ }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── DELETE /me ── */
router.delete('/', requireAuth, async (req, res) => {
  const user = await User.findByIdAndDelete(req.user.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Clear auth cookie upon account deletion
  res.clearCookie('auth_token', cookieOpts);
  return res.json({ ok: true });
});

/* ── PATCH /me/share-progress ── */
router.patch('/share-progress', requireAuth, async (req, res) => {
  try {
    const { shareProgressWithTherapist } = req.body;
    if (typeof shareProgressWithTherapist !== 'boolean') {
      return res.status(400).json({ error: 'shareProgressWithTherapist must be a boolean' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    user.shareProgressWithTherapist = shareProgressWithTherapist;
    await user.save();
    
    return res.json({ ok: true, shareProgressWithTherapist: user.shareProgressWithTherapist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── POST /me/set-tier ── */
router.post('/set-tier', requireAuth, async (req, res) => {
  try {
    const { tier } = req.body;
    const allowed = ['free', 'silver', 'gold', 'platinum'];
    if (!allowed.includes(tier)) return res.status(400).json({ error: 'Invalid tier' });
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    user.subscriptionTier = tier;
    
    // Set expiry to 1 month from now
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    user.subscriptionExpiresAt = nextMonth;
    
    // Wipe credits and force a reset so handleCreditReset does the right thing
    user.aiWeeklyCredits = 0;
    user.lastCreditReset = null;
    
    // Also run handleCreditReset manually so they immediately get their new tier's weekly credits
    const { handleCreditReset } = await import('../middleware/planCheck.js');
    await handleCreditReset(user);
    
    // Set Therapy quota based on tier
    // Free: 0, Silver: 0, Gold: 1, Platinum: 2
    const quotaMap = { free: 0, silver: 0, gold: 1, platinum: 2 };
    user.freeTherapyQuota = quotaMap[tier];
    
    await user.save();
    
    return res.json({ ok: true, tier: user.subscriptionTier, aiCreditsRemaining: user.aiWeeklyCredits, freeTherapyQuota: user.freeTherapyQuota });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
