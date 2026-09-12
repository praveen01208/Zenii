import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const therapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  licenseImage: { type: String, default: '' },

  // Professional Details (Managed by Admin)
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  education: { type: String, required: true },
  clinicAddress: { type: String, required: true },
  about: { type: String, default: '' },
  languages: { type: [String], default: ['English', 'Hindi'] },

  // Identity verification (Admin only — never exposed to users/therapists)
  aadharNumber: { type: String, default: '' },
  identityCardType: { type: String, default: 'Aadhaar' }, // 'Aadhaar' | 'Voter ID' | 'Passport' | 'PAN'
  identityCardImage: { type: String, default: '' },

  // Therapist-editable personal info
  residentialAddress: { type: String, default: '' },
  clinicImages: [{ type: String }],
  sessionType: { type: String, enum: ['online', 'offline', 'both'], default: 'online' },

  // Status
  isSuspended: { type: Boolean, default: false },
  role: { type: String, default: 'therapist' },

  // Settings (Managed by Therapist)
  sessionTime: { type: Number, default: 30 },
  sessionCost: { type: Number, default: 500 },
  availableSlots: [{ type: String }],
  notes: { type: String, default: '' },
  
  // Status tracking
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },

  // Blocked users
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

therapistSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const Therapist = mongoose.model('Therapist', therapistSchema);
