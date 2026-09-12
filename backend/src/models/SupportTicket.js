import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['contact', 'report'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
