import mongoose from 'mongoose';

const therapistTicketSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  therapistName: { type: String, required: true },
  therapistEmail: { type: String, required: true },
  category: {
    type: String,
    enum: ['profile_update', 'tech', 'billing', 'account', 'other'],
    required: true
  },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'in_review', 'resolved', 'rejected'],
    default: 'open'
  },
  adminReply: { type: String, default: '' },
  adminNote: { type: String, default: '' }, // internal only, not shown to therapist
}, { timestamps: true });

export const TherapistTicket = mongoose.model('TherapistTicket', therapistTicketSchema);
export default TherapistTicket;
