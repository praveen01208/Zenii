import mongoose from 'mongoose';

/* ── Circle (topic-based group) ─────────────────────────────── */
const circleSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    category: {
      type: String,
      enum: ['anxiety', 'depression', 'stress', 'sleep', 'self_esteem',
             'loneliness', 'exam_pressure', 'family', 'motivation', 'general'],
      default: 'general',
    },
    icon:          { type: String, default: '💬' }, // display icon (kept as plain text in DB only)
    memberCount:   { type: Number, default: 0 },
    messageCount:  { type: Number, default: 0 },
    isActive:      { type: Boolean, default: true },
    gradientFrom:  { type: String, default: '#0d5d3a' },
    gradientTo:    { type: String, default: '#1a8a5a' },
  },
  { timestamps: true }
);

export const Circle = mongoose.model('Circle', circleSchema);

/* ── Circle Message ─────────────────────────────────────────── */
const circleMessageSchema = new mongoose.Schema(
  {
    circleId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Circle', required: true },
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    authorName:  { type: String, required: true },  // 'Anonymous' or user display name
    content:     { type: String, required: true, trim: true, maxlength: 1000 },
    isAnonymous: { type: Boolean, default: false },
    isDeleted:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

circleMessageSchema.index({ circleId: 1, createdAt: -1 });

export const CircleMessage = mongoose.model('CircleMessage', circleMessageSchema);

/* ── Circle Membership (tracks unique members) ──────────────── */
const circleMemberSchema = new mongoose.Schema(
  {
    circleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Circle', required: true },
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

circleMemberSchema.index({ circleId: 1, userId: 1 }, { unique: true });

export const CircleMember = mongoose.model('CircleMember', circleMemberSchema);
