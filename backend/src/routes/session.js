import { Router } from 'express';
import { Session } from '../models/Session.js';
import { Therapist } from '../models/Therapist.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { requireTherapist } from './therapist.js';
import {
  sendSessionBookingUser,
  sendSessionBookingTherapist,
  sendSessionReminderUser,
  sendSessionReminderTherapist,
  sendSessionCompleteUser,
  sendCancellationUser,
  sendCancellationTherapistNotif,
  sendTherapistNoShowUser,
} from '../utils/mailer.js';

const router = Router();

// ─── Helper: schedule 10-min reminders (in-process, lost on restart) ─────────
function scheduleReminders({ user, therapist, session }) {
  const sessionMs   = new Date(session.date).getTime();
  const reminderMs  = sessionMs - 10 * 60 * 1000;
  const delay       = reminderMs - Date.now();
  if (delay <= 0) return; // session too soon / already passed
  setTimeout(async () => {
    const sd = fmtDate(session.date);
    const st = fmtTime(session.date);
    sendSessionReminderUser({
      toEmail: user.email, userName: user.name,
      therapistName: therapist.name, sessionDate: sd, sessionTime: st
    }).catch(e => console.error('[Mailer] reminder-user:', e.message));
    sendSessionReminderTherapist({
      toEmail: therapist.email, therapistName: therapist.name,
      userName: user.name, sessionDate: sd, sessionTime: st
    }).catch(e => console.error('[Mailer] reminder-therapist:', e.message));
  }, delay);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

// ─── Helper: minutes until session ──────────────────────────────────────────
function minutesUntil(sessionDate) {
  return (new Date(sessionDate) - Date.now()) / (1000 * 60);
}

// ─── Helper: refund % based on time until session ────────────────────────────
// Critical window: < 12 minutes → 50% refund (platform keeps 50% as fee)
function refundPercent(sessionDate) {
  const minsLeft = minutesUntil(sessionDate);
  if (minsLeft < 12) return 50;  // critical time — 50% retained as platform fee
  const days = minsLeft / (60 * 24);
  if (days >= 3) return 100;
  if (days >= 2) return 80;
  return 70;
}

/* ── POST /api/sessions/create-order (Razorpay Payment Order) ── */
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const { therapistId, slotISO } = req.body;
    if (!therapistId || !slotISO) return res.status(400).json({ error: 'Missing therapistId or slotISO' });

    const minsToSession = minutesUntil(slotISO);
    if (minsToSession < 12) {
      return res.status(400).json({
        error: 'This session starts in less than 12 minutes and can no longer be booked. Please choose another slot.'
      });
    }

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    const slotIndex = therapist.availableSlots.indexOf(slotISO);
    if (slotIndex === -1) return res.status(409).json({ error: 'Slot is no longer available' });

    const sessionCost = therapist.sessionCost || 0;
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_THJ5SFW5uF9d90';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If session is free
    if (sessionCost <= 0) {
      return res.json({
        ok: true,
        isFree: true,
        order: { id: `free_order_${Date.now()}`, amount: 0, currency: 'INR' },
        therapist: { _id: therapist._id, name: therapist.name, sessionCost: 0 },
        keyId,
      });
    }

    let orderId = `order_${Date.now()}`;
    const amountInPaise = sessionCost * 100;

    if (keySecret && keySecret !== 'demo_secret_or_test') {
      try {
        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `sess_${therapist._id}_${req.user.id}_${Date.now()}`.slice(0, 40),
          notes: { therapistId: therapist._id.toString(), userId: req.user.id, slotISO },
        });
        orderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn('[Session Payment] Razorpay SDK create order fallback:', rzpErr.message);
      }
    }

    return res.json({
      ok: true,
      order: {
        id: orderId,
        amount: amountInPaise,
        currency: 'INR',
      },
      therapist: {
        _id: therapist._id,
        name: therapist.name,
        sessionCost: therapist.sessionCost,
        education: therapist.education,
      },
      keyId,
    });
  } catch (err) {
    console.error('[Session create-order] error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to initialize payment' });
  }
});

/* ── POST /api/sessions/verify-and-book (Verify Razorpay Payment & Confirm Slot) ── */
router.post('/verify-and-book', requireAuth, async (req, res) => {
  try {
    const { therapistId, slotISO, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!therapistId || !slotISO) return res.status(400).json({ error: 'Missing therapistId or slotISO' });

    // 12-minute cutoff check
    const minsToSession = minutesUntil(slotISO);
    if (minsToSession < 12) {
      return res.status(400).json({
        error: 'This session starts in less than 12 minutes and can no longer be booked. Please choose another slot.'
      });
    }

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    const slotIndex = therapist.availableSlots.indexOf(slotISO);
    if (slotIndex === -1) return res.status(409).json({ error: 'Slot is no longer available' });

    // Verify signature if secret is active
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && keySecret !== 'demo_secret_or_test' && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const crypto = (await import('crypto')).default;
      const expected = crypto.createHmac('sha256', keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
      if (expected !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid payment signature verification' });
      }
    }

    // Reserve slot
    therapist.availableSlots.splice(slotIndex, 1);
    await therapist.save();

    const user = await User.findById(req.user.id).lean();

    const session = await Session.create({
      user: req.user.id,
      therapist: therapist._id,
      therapistName: therapist.name,
      date: new Date(slotISO),
      amountPaid: therapist.sessionCost || 0,
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
      orderId: razorpay_order_id || `order_${Date.now()}`,
      status: 'booked',
    });

    // Send booking confirmation emails (non-blocking)
    const sd = fmtDate(session.date);
    const st = fmtTime(session.date);
    sendSessionBookingUser({
      toEmail: user.email, userName: user.name,
      therapistName: therapist.name, therapistSpec: therapist.specialization,
      therapistClinic: therapist.clinicAddress, sessionDate: sd, sessionTime: st,
      amountPaid: therapist.sessionCost, sessionDuration: therapist.sessionTime
    }).catch(e => console.error('[Mailer] booking-user:', e.message));

    sendSessionBookingTherapist({
      toEmail: therapist.email, therapistName: therapist.name,
      userName: user.name, userPhone: user.phone,
      sessionDate: sd, sessionTime: st,
      sessionDuration: therapist.sessionTime, amountPaid: therapist.sessionCost
    }).catch(e => console.error('[Mailer] booking-therapist:', e.message));

    // Schedule 10-min reminders
    scheduleReminders({ user, therapist, session });

    return res.json({ ok: true, session, message: 'Payment verified and session confirmed!' });
  } catch (err) {
    console.error('[Session verify-and-book] error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to complete booking' });
  }
});

/* ── POST /api/sessions/book (Direct / Demo Booking) ── */
router.post('/book', requireAuth, async (req, res) => {
  try {
    const { therapistId, slotISO } = req.body;
    if (!therapistId || !slotISO) return res.status(400).json({ error: 'Missing therapistId or slotISO' });

    // ── 12-minute booking cutoff ──────────────────────────────────────────────
    const minsToSession = minutesUntil(slotISO);
    if (minsToSession < 12) {
      return res.status(400).json({
        error: 'This session starts in less than 12 minutes and can no longer be booked. Please choose another slot.'
      });
    }

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    const slotIndex = therapist.availableSlots.indexOf(slotISO);
    if (slotIndex === -1) return res.status(409).json({ error: 'Slot is no longer available' });

    therapist.availableSlots.splice(slotIndex, 1);
    await therapist.save();

    const user = await User.findById(req.user.id).lean();

    const session = await Session.create({
      user: req.user.id,
      therapist: therapist._id,
      therapistName: therapist.name,
      date: new Date(slotISO),
      amountPaid: therapist.sessionCost
    });

    // Send booking confirmation emails (non-blocking)
    const sd = fmtDate(session.date);
    const st = fmtTime(session.date);
    sendSessionBookingUser({
      toEmail: user.email, userName: user.name,
      therapistName: therapist.name, therapistSpec: therapist.specialization,
      therapistClinic: therapist.clinicAddress, sessionDate: sd, sessionTime: st,
      amountPaid: therapist.sessionCost, sessionDuration: therapist.sessionTime
    }).catch(e => console.error('[Mailer] booking-user:', e.message));

    sendSessionBookingTherapist({
      toEmail: therapist.email, therapistName: therapist.name,
      userName: user.name, userPhone: user.phone,
      sessionDate: sd, sessionTime: st,
      sessionDuration: therapist.sessionTime, amountPaid: therapist.sessionCost
    }).catch(e => console.error('[Mailer] booking-therapist:', e.message));

    // Schedule 10-min reminders
    scheduleReminders({ user, therapist, session });

    return res.json({ ok: true, session });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/sessions/me ── */
router.get('/me', requireAuth, async (req, res) => {
  try {
    let sessions = await Session.find({ user: req.user.id }).sort({ date: 1 }).lean();
    const now = new Date();
    const user = await User.findById(req.user.id).lean();

    const updatedSessions = await Promise.all(sessions.map(async (s) => {
      if (s.status === 'booked' && now.getTime() > new Date(s.date).getTime() + 10 * 60 * 1000) {
        const updated = await Session.findByIdAndUpdate(s._id, { status: 'cancelled' }, { new: true }).lean();
        // Auto-cancel: user no-show → 70% refund
        const therapist = await Therapist.findById(s.therapist).lean();
        if (user && therapist) {
          sendCancellationUser({
            toEmail: user.email, userName: user.name,
            therapistName: s.therapistName,
            sessionDate: fmtDate(s.date), sessionTime: fmtTime(s.date),
            amountPaid: s.amountPaid, refundPct: 70, reason: 'noshow'
          }).catch(e => console.error('[Mailer] auto-cancel-noshow:', e.message));
        }
        return updated;
      }
      return s;
    }));

    return res.json({ ok: true, sessions: updatedSessions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/* ── GET /api/sessions/therapist ── */
router.get('/therapist', requireTherapist, async (req, res) => {
  try {
    let sessions = await Session.find({ therapist: req.therapist._id })
      .populate('user', 'name email phone')
      .sort({ date: 1 })
      .lean();

    const now = new Date();
    const updatedSessions = await Promise.all(sessions.map(async (s) => {
      if (s.status === 'booked' && now.getTime() > new Date(s.date).getTime() + 10 * 60 * 1000) {
        const updated = await Session.findByIdAndUpdate(s._id, { status: 'cancelled' }, { new: true })
          .populate('user', 'name email phone').lean();
        // Therapist no-show → 100% refund to user
        if (s.user) {
          sendTherapistNoShowUser({
            toEmail: s.user.email, userName: s.user.name,
            therapistName: s.therapistName,
            sessionDate: fmtDate(s.date), sessionTime: fmtTime(s.date),
            amountPaid: s.amountPaid
          }).catch(e => console.error('[Mailer] therapist-noshow:', e.message));
        }
        return updated;
      }
      return s;
    }));

    return res.json({ ok: true, sessions: updatedSessions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/* ── DELETE /api/sessions/past ── */
router.delete('/past', requireAuth, async (req, res) => {
  try {
    const { sessionIds } = req.body;
    if (!Array.isArray(sessionIds)) return res.status(400).json({ error: 'Invalid input' });
    const now = new Date();
    // Allow deletion if date is in the past OR status is cancelled/completed
    // (a cancelled session can have a future date — user cancelled before it happened)
    const result = await Session.deleteMany({
      _id: { $in: sessionIds },
      user: req.user.id,
      $or: [
        { date: { $lt: now } },
        { status: { $in: ['cancelled', 'completed'] } },
      ],
    });
    return res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete past sessions' });
  }
});

/* ── POST /api/sessions/:id/rate ── */
router.post('/:id/rate', requireAuth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid rating. Must be between 1 and 5.' });
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { rating, review, status: 'completed' },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found or unauthorized' });
    return res.json({ ok: true, session });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit rating' });
  }
});

/* ── POST /api/sessions/:id/complete ── */
router.post('/:id/complete', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, { status: 'completed' }, { new: true });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Send post-session thank-you to user
    const user = await User.findById(session.user).lean();
    if (user) {
      sendSessionCompleteUser({
        toEmail: user.email, userName: user.name, therapistName: session.therapistName
      }).catch(e => console.error('[Mailer] post-session:', e.message));
    }

    return res.json({ ok: true, session });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to complete session' });
  }
});

/* ── POST /api/sessions/:id/cancel ── */
router.post('/:id/cancel', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('user', 'name email phone');
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const therapist = await Therapist.findById(session.therapist);
    const minsLeft   = minutesUntil(session.date);
    const isCritical = minsLeft > 0 && minsLeft < 12; // within 12-min critical window
    const refundPct  = refundPercent(session.date);
    const sd = fmtDate(session.date);
    const st = fmtTime(session.date);

    session.status = 'cancelled';
    await session.save();

    // ── Restore slot only if session is still >12 minutes away ───────────────
    // (If within the critical window, the slot is too close to be re-booked)
    if (therapist && minsLeft > 12) {
      const slotISO = new Date(session.date).toISOString();
      if (!therapist.availableSlots.includes(slotISO)) {
        therapist.availableSlots.push(slotISO);
        await therapist.save();
      }
    }

    // Email user with refund details
    if (session.user) {
      sendCancellationUser({
        toEmail: session.user.email, userName: session.user.name,
        therapistName: session.therapistName,
        sessionDate: sd, sessionTime: st,
        amountPaid: session.amountPaid, refundPct,
        reason: isCritical ? 'critical' : 'manual'
      }).catch(e => console.error('[Mailer] cancel-user:', e.message));
    }

    // Notify therapist that slot was cancelled
    if (therapist && session.user) {
      sendCancellationTherapistNotif({
        toEmail: therapist.email, therapistName: therapist.name,
        userName: session.user.name, sessionDate: sd, sessionTime: st
      }).catch(e => console.error('[Mailer] cancel-therapist:', e.message));
    }

    return res.json({ ok: true, session, refundPct, isCritical });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel session' });
  }
});

export default router;
