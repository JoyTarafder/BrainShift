import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  name: string;
  courseId: mongoose.Types.ObjectId | string;
  startDate: Date;
  classSchedule: string;
  maxStudents: number;
  enrolledCount: number;
  status: 'upcoming' | 'active' | 'completed';
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
  },
  { timestamps: true }
);

const Batch = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

export default Batch;
