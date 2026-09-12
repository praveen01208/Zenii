import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  therapistName: { type: String, required: true },
  date: { type: Date, required: true },
  amountPaid: { type: Number, required: true },
  paymentId: { type: String, default: '' },
  orderId: { type: String, default: '' },
  status: { type: String, enum: ['booked', 'completed', 'cancelled'], default: 'booked', index: true },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, default: '' }
}, { timestamps: true });

sessionSchema.index({ user: 1, date: -1 });
sessionSchema.index({ therapist: 1, date: -1 });
sessionSchema.index({ status: 1, date: 1 });

export const Session = mongoose.model('Session', sessionSchema);
