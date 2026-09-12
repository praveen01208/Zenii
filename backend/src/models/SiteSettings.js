import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  activeUsers: {
    type: String,
    required: true,
    default: '50K+'
  },
  satisfactionRate: {
    type: String,
    required: true,
    default: '98%'
  },
  therapistsCount: {
    type: String,
    required: true,
    default: '1000+'
  },
  supportAvailable: {
    type: String,
    required: true,
    default: '24/7'
  }
}, { timestamps: true });

export default mongoose.model('SiteSettings', siteSettingsSchema);
