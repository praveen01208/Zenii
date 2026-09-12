import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  department:      { type: String, default: '' },
  location:        { type: String, default: '' },
  employmentType:  { type: String, default: 'Full-time' }, // Full-time, Part-time, Internship, Contract
  experience:      { type: String, default: '' },
  salary:          { type: String, default: '' },
  shortDescription:{ type: String, default: '' },
  description:     { type: String, default: '' },
  responsibilities:{ type: [String], default: [] },
  requirements:    { type: [String], default: [] },
  benefits:        { type: [String], default: [] },
  skills:          { type: [String], default: [] },
  openings:        { type: Number, default: 1 },
  applyUrl:        { type: String, default: '' },   // external apply link
  applyEmail:      { type: String, default: '' },   // or email
  status:          { type: String, default: 'active', enum: ['active', 'closed'], index: true },
  featured:        { type: Boolean, default: false, index: true },
  slug:            { type: String, unique: true, sparse: true },
  postedDate:      { type: Date, default: Date.now },
}, { timestamps: true });

jobSchema.index({ department: 1, status: 1 });

// Auto-generate slug from title
jobSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }
  next();
});

const jobApplicationSchema = new mongoose.Schema({
  jobId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  jobTitle:     { type: String },
  name:         { type: String, required: true },
  email:        { type: String, required: true },
  phone:        { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
  coverLetter:  { type: String, default: '' },
  resumeBase64: { type: String, default: '' },
  resumeMime:   { type: String, default: '' },
  status:       { type: String, default: 'new', enum: ['new', 'reviewed', 'shortlisted', 'rejected'] },
}, { timestamps: true });

export const Job = mongoose.model('Job', jobSchema);
export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
