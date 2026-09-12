import { getAuth } from '@clerk/express';
import { verifyJwt } from '../utils/jwt.js';
import User from '../models/User.js';
import { cookieOpts } from '../utils/cookieOptions.js';

export async function requireAuth(req, res, next) {
  try {
    // 1. Check for Clerk authentication
    try {
      const clerkAuth = (typeof getAuth === 'function') ? getAuth(req) : null;
      const clerkId = clerkAuth?.userId || req.auth?.userId;
      if (clerkId) {
        let user = await User.findOne({ clerkId });

        if (!user) {
          const userEmail = req.headers['x-clerk-user-email'] || `${clerkId}@user.clerk`;
          const userName = req.headers['x-clerk-user-name'] || 'Friend';

          user = await User.findOne({ email: userEmail });
          if (user) {
            user.clerkId = clerkId;
            await user.save();
          } else {
            user = await User.create({
              clerkId,
              name: userName,
              email: userEmail,
              phone: '',
              age: 20,
              gender: 'other',
              passwordHash: '',
              aiWeeklyCredits: 10,
              subscriptionTier: 'free',
            });
          }
        }

        if (user.isSuspended) {
          return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
        }

        req.user = { id: String(user._id), clerkId };
        return next();
      }
    } catch (clerkErr) {
      // If getAuth fails (e.g. no clerk context), continue to token check
    }

    // 2. Check for Bearer token or local cookie JWT
    let token = req.cookies?.auth_token || req.query.token || null;
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = verifyJwt(token);
    const user = await User.findById(decoded.sub).lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (user.isSuspended) {
      res.clearCookie('auth_token', cookieOpts);
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    req.user = { id: String(user._id) };
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}


