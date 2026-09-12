import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  role:        { type: String, required: true },
  bio:         { type: String, default: '' },
  imageBase64: { type: String, default: '' },  // base64 stored image
  imageUrl:    { type: String, default: '' },  // or external URL
  linkedinUrl: { type: String, default: '' },
  twitterUrl:  { type: String, default: '' },
  profileLink: { type: String, default: '' },  // card click redirect
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('TeamMember', teamMemberSchema);
