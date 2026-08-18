import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBatchMaterial {
  _id?: string;
  title: string;
  url: string;
  type: 'pdf' | 'slide' | 'note' | 'video';
  addedAt?: Date;
}

export interface IBatchModule {
  _id?: string;
  title: string;
  type?: 'video' | 'pdf' | 'link';
  url: string;
  durationMinutes?: number;
}

export interface IBatch extends Document {
  name: string;
  courseId: mongoose.Types.ObjectId | string;
  startDate: Date;
  classSchedule: string;
  maxStudents: number;
  enrolledCount: number;
  status: 'upcoming' | 'active' | 'completed';
  meetUrl?: string;
  whatsappUrl?: string;
  notice?: string;
  materials?: IBatchMaterial[];
  modules?: IBatchModule[];
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    name: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    startDate: { type: Date, default: Date.now },
    classSchedule: { type: String, required: true },
    maxStudents: { type: Number, default: 30 },
    enrolledCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'active',
    },
    meetUrl: { type: String, default: '' },
    whatsappUrl: { type: String, default: '' },
    notice: { type: String, default: '' },
    materials: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, enum: ['pdf', 'slide', 'note', 'video'], default: 'pdf' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    modules: [
      {
        title: { type: String, required: true },
        type: { type: String, enum: ['video', 'pdf', 'link'], default: 'video' },
        url: { type: String, required: true },
        durationMinutes: { type: Number },
      },
    ],
  },
  { timestamps: true, strict: false }
);

if (mongoose.models?.Batch) {
  delete mongoose.models.Batch;
}

const Batch: Model<IBatch> = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

export default Batch;
