import mongoose from 'mongoose';

// ── Weekly limits per tier (platinum = -1 means unlimited) ─────────────────
const WEEKLY_LIMITS = {
  free:     10,
  silver:   150,
  gold:     250,
  platinum: -1, // unlimited — tracked as -1, never decremented
};

// ── IST helpers ────────────────────────────────────────────────────────────

/**
 * Returns a JS Date object representing "right now" in IST.
 * (Not a real timezone Date — just UTC shifted by +05:30 so UTC methods
 *  on it give you IST values.)
 */
function getISTNow() {
  const utcMs = Date.now();
  return new Date(utcMs + 5.5 * 60 * 60 * 1000); // +05:30
}

/**
 * Returns the UTC timestamp of the most recent Sunday 00:00:00 IST.
 * i.e.  Sunday 00:00 IST  =  Saturday 18:30 UTC.
 */
function getLastSundayMidnightUTC() {
  const istNow = getISTNow();

  // istNow.getUTCDay()  ← gives IST day-of-week because we shifted by +05:30
  const dayOfWeek = istNow.getUTCDay(); // 0 = Sunday

  // How many whole days have passed since the last Sunday in IST?
  const daysBack = dayOfWeek; // 0 on Sunday itself

  // Midnight of that Sunday in IST
  const lastSundayIST = new Date(istNow);
  lastSundayIST.setUTCDate(istNow.getUTCDate() - daysBack);
  lastSundayIST.setUTCHours(0, 0, 0, 0);

  // Convert back to UTC (subtract 05:30)
  return new Date(lastSundayIST.getTime() - 5.5 * 60 * 60 * 1000);
}

/**
 * Returns the UTC timestamp of the first moment of the current month in IST.
 * e.g.  1 May 00:00 IST  =  30 Apr 18:30 UTC.
 */
function getMonthStartUTC() {
  const istNow = getISTNow();
  const firstDayIST = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), 1, 0, 0, 0, 0));
  return new Date(firstDayIST.getTime() - 5.5 * 60 * 60 * 1000);
}

// ── Core reset / expiry logic ──────────────────────────────────────────────

/**
 * Called at the start of every AI-chat request.
 * Handles two independent checks in order:
 *
 *  1. MONTH-END EXPIRY
 *     If subscriptionExpiresAt has passed → revert user to free, wipe credits.
 *
 *  2. WEEKLY SUNDAY RESET
 *     If we're past the most recent Sunday 00:00 IST and the user hasn't been
 *     reset yet this week:
 *       - Add this week's allocation to any REMAINING credits (carryover).
 *       - Platinum stays unlimited (-1).
 *
 * Returns the (potentially mutated and saved) user document.
 */
export async function handleCreditReset(user) {
  const nowUTC   = new Date();          // real UTC now
  const istNow   = getISTNow();        // "now" expressed in IST
  let   dirty    = false;

  // ── 1. End of Calendar Month Wipe ──────────────────────────────────────────
  const monthStartUTC = getMonthStartUTC();
  const needsMonthReset = !user.lastMonthReset || new Date(user.lastMonthReset) < monthStartUTC;

  if (needsMonthReset) {
    // End of calendar month! Wipe all carryover credits so they start fresh for the new month.
    user.aiWeeklyCredits = 0;
    user.lastCreditReset = null; // Force weekly reset to give base allocation
    user.lastMonthReset = nowUTC;
    dirty = true;
  }

  // ── 1b. Subscription Expiry ──────────────────────────────────────────────
  if (
    user.subscriptionTier !== 'free' &&
    user.subscriptionExpiresAt &&
    nowUTC >= new Date(user.subscriptionExpiresAt)
  ) {
    // Completely finish plan, back to basic
    user.subscriptionTier      = 'free';
    user.subscriptionExpiresAt = null;
    user.aiWeeklyCredits       = 0;     // wipe credits
    user.lastCreditReset       = null;  // force weekly reset to give them the 10 basic credits
    dirty = true;
  }

  // ── 2. Weekly Sunday reset (with carryover) ──────────────────────────────
  const lastSundayUTC = getLastSundayMidnightUTC();

  const needsWeeklyReset =
    !user.lastCreditReset ||
    new Date(user.lastCreditReset) < lastSundayUTC;

  if (needsWeeklyReset) {
    const tier  = user.subscriptionTier || 'free';
    const limit = WEEKLY_LIMITS[tier];

    if (limit === -1) {
      // Platinum — unlimited, store sentinel value
      user.aiWeeklyCredits = -1;
    } else {
      // Carry over whatever credits remain, then add this week's allocation.
      // Clamp remaining to 0 in case it somehow went negative.
      const carried = Math.max(0, user.aiWeeklyCredits || 0);
      user.aiWeeklyCredits = carried + limit;
    }

    user.lastCreditReset = nowUTC;
    dirty = true;
  }

  if (dirty) {
    await user.save();
  }

  return user;
}

// ── Helpers for routes ─────────────────────────────────────────────────────

/** Fetch user by ID (convenience) */
export async function getUser(userId) {
  const User = mongoose.model('User');
  return User.findById(userId);
}

/** Everything is free — always has credits */
export function hasCredits(user) {
  return true;
}

/** Everything is free — no credit deduction */
export async function deductOneCredit(user) {
  return;
}

// ── Tier-guard middleware ──────────────────────────────────────────────────
const TIER_ORDER = ['free', 'silver', 'gold', 'platinum'];

/**
 * Express middleware factory.
 * Usage:  router.get('/dashboard', requireTier('platinum'), handler)
 */
export function requireTier(minTier) {
  return async (req, res, next) => {
    // Everything is free — always allow access
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const user = await getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    req.userDoc = user;
    return next();
  };
}

export default { handleCreditReset, requireTier, hasCredits, deductOneCredit, getUser };
