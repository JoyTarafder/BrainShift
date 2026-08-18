import mongoose from 'mongoose';

const CourseModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'pdf', 'link'], default: 'video' },
  url: { type: String, required: true },
  durationMinutes: { type: Number },
});

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    subject: { type: String, required: true, index: true },
    level: { type: String, default: 'Beginner' },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0, default: 0 },
    enrollmentOpen: { type: Boolean, default: true },
    batchInfo: { type: String, default: 'Batch 01 (Sat, Mon, Wed • 8:00 PM)' },
    thumbnailUrl: { type: String, required: true },
    syllabus: [{ type: String }],
    duration: { type: String, required: true },
    modules: [CourseModuleSchema],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

export default Course;
