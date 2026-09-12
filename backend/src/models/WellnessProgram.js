import mongoose from 'mongoose';

/* ── Program Step (one per day) ─────────────────────────────── */
const programStepSchema = new mongoose.Schema({
  dayNumber:    { type: Number, required: true },
  title:        { type: String, required: true, trim: true },
  content:      { type: String, required: true, trim: true }, // Instructions / guidance text
  exerciseType: {
    type: String,
    enum: ['breathing', 'journaling', 'meditation', 'movement', 'reading', 'reflection', 'other'],
    default: 'other',
  },
  durationMinutes: { type: Number, default: 10 },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', default: null },
}, { _id: true });

/* ── Wellness Program ───────────────────────────────────────── */
const wellnessProgramSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    category: {
      type: String,
      enum: ['anxiety', 'stress', 'sleep', 'self_esteem', 'mindfulness', 'motivation', 'other'],
      default: 'other',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    durationDays:      { type: Number, required: true, min: 1, max: 90 },
    steps:             [programStepSchema],
    enrollmentCount:   { type: Number, default: 0 },
    isPublished:       { type: Boolean, default: true },
    coverGradientFrom: { type: String, default: '#0d5d3a' },
    coverGradientTo:   { type: String, default: '#1a8a5a' },
    isCustom:          { type: Boolean, default: false },
    createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    visibility:        { type: String, enum: ['public', 'private'], default: 'private' },
    authorName:        { type: String },
  },
  { timestamps: true }
);

export const WellnessProgram = mongoose.model('WellnessProgram', wellnessProgramSchema);

/* ── Enrollment ─────────────────────────────────────────────── */
const programEnrollmentSchema = new mongoose.Schema(
  {
    userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    programId:         { type: mongoose.Schema.Types.ObjectId, ref: 'WellnessProgram', required: true },
    currentDay:        { type: Number, default: 1 },
    completedDays:     [{ type: Number }],   // array of completed day numbers
    dayCompletedDates: { type: Map, of: Date, default: {} }, // dayNumber -> completedAt date
    isCompleted:       { type: Boolean, default: false },
    completedAt:       { type: Date, default: null },
  },
  { timestamps: true }
);

programEnrollmentSchema.index({ userId: 1, programId: 1 }, { unique: true });

export const ProgramEnrollment = mongoose.model('ProgramEnrollment', programEnrollmentSchema);
