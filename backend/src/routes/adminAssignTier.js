// admin route for assigning subscription tiers (demo purpose only)
import express from 'express';
const router = express.Router();

// assumes auth middleware that sets req.userId and admin check
router.post('/assign-tier', async (req, res) => {
  const { userId, tier } = req.body;
  const allowed = ['free', 'silver', 'gold', 'platinum'];
  if (!allowed.includes(tier)) return res.status(400).json({ error: 'Invalid tier' });
  const User = req.app.get('mongoose').model('User');
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.subscriptionTier = tier;
  // set free therapy quota and ai credits based on tier
  const quotaMap = { free: 0, silver: 0, gold: 1, platinum: 2 };
  const creditsMap = { free: 10, silver: 50, gold: 150, platinum: 999999 };
  user.freeTherapyQuota = quotaMap[tier];
  user.aiCreditsRemaining = creditsMap[tier];
  
  // Custom billing date reset (1 month from now)
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  user.subscriptionBillingDate = nextMonth;
  
  await user.save();
  res.json({ success: true, tier: user.subscriptionTier, freeTherapyQuota: user.freeTherapyQuota, aiCreditsRemaining: user.aiCreditsRemaining });
});

export default router;
