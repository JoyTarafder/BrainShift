import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICourseModule {
  title: string;
  type: 'video' | 'pdf' | 'link';
  url: string;
  durationMinutes?: number;
}

export interface ICourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  subject: string;
  level: string;
  price: number;
  oldPrice?: number;
  enrollmentOpen?: boolean;
  batchInfo?: string;
  thumbnailUrl: string;
  syllabus: string[];
  duration: string;
  modules: ICourseModule[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const CourseModuleSchema = new Schema<ICourseModule>({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'pdf', 'link'], default: 'video' },
  url: { type: String, required: true },
  durationMinutes: { type: Number },
});

const CourseSchema = new Schema<ICourse>(
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
  {
    timestamps: true,
  }
);

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
