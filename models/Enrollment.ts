import mongoose, { Schema, Model } from 'mongoose';
import { ICourse } from './Course';

export interface IEnrollment {
  _id: string;
  studentId: string;
  courseId: string | ICourse;
  orderId?: string;
  enrolledAt?: Date;
  progressPercentage: number;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId as any, ref: 'Course', required: true },
    orderId: { type: Schema.Types.ObjectId as any, ref: 'Order' },
    progressPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

export default Enrollment;
