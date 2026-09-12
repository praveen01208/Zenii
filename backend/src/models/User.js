import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, sparse: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  age: { type: Number, min: 1, max: 120, default: 20 },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  passwordHash: { type: String, default: '' },
  isSuspended: { type: Boolean, default: false },
  suspendedUntil: { type: Date, default: null }, // null = permanent when isSuspended=true
  avatar: {
    mime: { type: String },
    data: { type: String }, // base64 (no local storage)
  },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  favouriteResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  onboardingDone: { type: Boolean, default: false },
  onboardingData: {
    goals: { type: [String], default: [] },
    currentMood: { type: Number, default: null }, // 1–5
    stressLevel: { type: Number, default: null }, // 1–5
    completedAt: { type: Date, default: null },
  },
  shareProgressWithTherapist: { type: Boolean, default: false },

  // ── Subscription & AI credit fields ─────────────────────────────────────
  subscriptionTier: {
    type: String,
    enum: ['free', 'silver', 'gold', 'platinum'],
    default: 'free',
  },
  // Remaining AI response credits for the current week.
  // Platinum users: stored as -1 (unlimited). Others: counted down from weekly limit.
  aiWeeklyCredits: { type: Number, default: 10 }, // 10 = free tier initial credits
  // Last time weekly credits were topped up (IST-based Sunday midnight)
  lastCreditReset: { type: Date, default: null },
  // Last time the monthly expiry check ran (used to detect month boundary)
  lastMonthReset: { type: Date, default: null },
  // When the paid subscription expires (IST end-of-month midnight)
  subscriptionExpiresAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
