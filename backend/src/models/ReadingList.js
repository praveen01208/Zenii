import mongoose from 'mongoose';

const readingItemSchema = new mongoose.Schema({
  type:        { type: String, enum: ['book','article','video','podcast','tool'], default: 'book' },
  title:       { type: String, required: true, trim: true },
  author:      { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  url:         { type: String, trim: true, default: '' },
  coverEmoji:  { type: String, default: '📖' },
}, { _id: true });

const readingListSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  description:     { type: String, trim: true, default: '' },
  category:        { type: String, default: 'general' },
  tags:            [{ type: String }],
  coverEmoji:      { type: String, default: '📚' },
  therapistId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  therapistName:   { type: String, required: true },
  items:           [readingItemSchema],
  isPublished:     { type: Boolean, default: false },  // therapist must publish
  isApproved:      { type: Boolean, default: false },  // admin must approve
  rejectionReason: { type: String, default: '' },
  savedBy:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saveCount:       { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('ReadingList', readingListSchema);
