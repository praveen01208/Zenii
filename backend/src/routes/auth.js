import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import { signJwt } from '../utils/jwt.js';
import { sendOtpEmail, sendWelcomeEmail } from '../utils/mailer.js';
import { requireAuth } from '../middleware/auth.js';
import { cookieOpts } from '../utils/cookieOptions.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Strict limit for auth endpoints
  message: { error: 'Too many authentication attempts, please try again later.' }
});

router.use(authLimiter);

/* ────────────────────────────────────────────────
   REGISTER
──────────────────────────────────────────────── */
const registerSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  phone:    z.string().min(8),
  age:      z.coerce.number().int().min(1).max(120),
  gender:   z.enum(['male', 'female', 'other']),
  password: z.string().min(6)
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { name, email, phone, age, gender, password } = parsed.data;

  const emailExists = await User.findOne({ email: email.toLowerCase() }).lean();
  if (emailExists) return res.status(409).json({ error: 'This email is already registered. Please log in.' });

  const phoneExists = await User.findOne({ phone }).lean();
  if (phoneExists) return res.status(409).json({ error: 'This mobile number is already registered.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), phone, age, gender, passwordHash });

  const token = signJwt({ sub: String(user._id) });

  sendWelcomeEmail({ toEmail: user.email, toName: user.name }).catch((err) =>
    console.error('[Mailer] ❌ Welcome email failed for', user.email, ':', err.message)
  );

  res.cookie('auth_token', token, cookieOpts);
  return res.json({ ok: true });
});

/* ────────────────────────────────────────────────
   LOGIN
──────────────────────────────────────────────── */
const loginSchema = z.object({
  identifier: z.string().min(3),
  password:   z.string().min(1)
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { identifier, password } = parsed.data;

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }]
  }).select('-avatar');
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  if (user.isSuspended) {
    return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signJwt({ sub: String(user._id) });
  res.cookie('auth_token', token, cookieOpts);
  return res.json({ ok: true });
});

/* ────────────────────────────────────────────────
   LOGOUT
──────────────────────────────────────────────── */
router.post('/logout', (_req, res) => {
  res.clearCookie('auth_token', cookieOpts);
  return res.json({ ok: true });
});

/* ────────────────────────────────────────────────
   SEND OTP (authenticated) — for logged-in users changing password
──────────────────────────────────────────────── */
router.post('/send-otp', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  await PasswordReset.create({ userId: user._id, codeHash, expiresAt });

  console.log(`[SendOTP] Sending OTP to ${user.email} for userId ${user._id}`);

  try {
    await sendOtpEmail({ toEmail: user.email, toName: user.name, code });
  } catch (err) {
    console.error('[Mailer] ❌ OTP email failed:', err.message);
    return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
  }

  return res.json({ ok: true, expiresInSeconds: 120 });
});

/* ────────────────────────────────────────────────
   FORGOT PASSWORD
──────────────────────────────────────────────── */
const forgotSchema = z.object({
  phone: z.string().min(8)
});

router.post('/forgot-password', async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please enter your registered mobile number' });

  const { phone } = parsed.data;
  const user = await User.findOne({ phone }).lean();

  if (!user) {
    console.log('[ForgotPw] Phone not found:', phone);
    return res.json({ ok: true, expiresInSeconds: 120 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  await PasswordReset.create({ userId: user._id, codeHash, expiresAt });

  console.log(`[ForgotPw] Sending OTP to email: ${user.email} (phone: ${phone})`);

  try {
    await sendOtpEmail({ toEmail: user.email, toName: user.name, code });
  } catch (err) {
    console.error('[Mailer] ❌ OTP email failed for', user.email, ':', err.message);
    return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
  }

  return res.json({ ok: true, expiresInSeconds: 120 });
});

/* ────────────────────────────────────────────────
   VERIFY OTP
──────────────────────────────────────────────── */
const verifyOtpSchema = z.object({
  phone: z.string().min(8),
  code:  z.string().regex(/^\d{6}$/)
});

router.post('/verify-otp', async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const { phone, code } = parsed.data;
  const user = await User.findOne({ phone });
  if (!user) return res.status(400).json({ error: 'Invalid code' });

  const tokenDoc = await PasswordReset.findOne({
    userId: user._id,
    usedAt: null,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!tokenDoc) return res.status(400).json({ error: 'Invalid or expired code' });
  const ok = await bcrypt.compare(code, tokenDoc.codeHash);
  if (!ok) return res.status(400).json({ error: 'Invalid or expired code' });

  return res.json({ ok: true });
});

/* ────────────────────────────────────────────────
   RESET PASSWORD
──────────────────────────────────────────────── */
const resetSchema = z.object({
  phone:       z.string().min(8),
  code:        z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(6)
});

router.post('/reset-password', async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const { phone, code, newPassword } = parsed.data;
  const user = await User.findOne({ phone });
  if (!user) return res.status(400).json({ error: 'Invalid code' });

  const tokenDoc = await PasswordReset.findOne({
    userId: user._id,
    usedAt: null,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!tokenDoc) return res.status(400).json({ error: 'Invalid or expired code' });
  const ok = await bcrypt.compare(code, tokenDoc.codeHash);
  if (!ok) return res.status(400).json({ error: 'Invalid or expired code' });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  tokenDoc.usedAt = new Date();
  await tokenDoc.save();

  return res.json({ ok: true });
});

/* ────────────────────────────────────────────────
   UPDATE PASSWORD (authenticated, with old pw)
──────────────────────────────────────────────── */
const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6)
});

router.post('/update-password', requireAuth, async (req, res) => {
  const parsed = updatePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { oldPassword, newPassword } = parsed.data;

  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Old password is incorrect' });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.json({ ok: true });
});

export default router;
