import mongoose from 'mongoose';

const therapistReportSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  therapistName: { type: String, required: true },
  therapistEmail: { type: String, required: true },
  reportType: {
    type: String,
    enum: ['misbehaviour', 'no_show', 'fraud', 'tech_failure', 'suspension_request', 'other'],
    required: true
  },
  urgency: { type: String, enum: ['normal', 'high', 'critical'], default: 'normal' },
  involvedUserEmail: { type: String, default: '' },
  involvedUserName: { type: String, default: '' },
  sessionReference: { type: String, default: '' }, // free-text session date/time ref
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['submitted', 'investigating', 'action_taken', 'closed'],
    default: 'submitted'
  },
  actionTaken: {
    type: String,
    enum: ['none', 'warned', 'suspended_7d', 'suspended_30d', 'suspended_perm', 'no_action'],
    default: 'none'
  },
  adminNote: { type: String, default: '' },      // internal only
  therapistNote: { type: String, default: '' },  // visible to therapist after resolution
}, { timestamps: true });

export const TherapistReport = mongoose.model('TherapistReport', therapistReportSchema);
export default TherapistReport;
