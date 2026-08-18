import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubmission {
  _id?: string;
  studentId: mongoose.Types.ObjectId | string;
  studentName: string;
  studentEmail: string;
  submissionUrl: string;
  notes?: string;
  submittedAt: Date;
  marksObtained?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface IAssignment extends Document {
  batchId: mongoose.Types.ObjectId | string;
  courseId?: mongoose.Types.ObjectId | string;
  title: string;
  description: string;
  totalMarks: number;
  dueDate: Date;
  submissions: ISubmission[];
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    submissionUrl: { type: String, required: true },
    notes: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
    marksObtained: { type: Number },
    feedback: { type: String, default: '' },
    status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
  },
  { _id: true }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    totalMarks: { type: Number, required: true, default: 100 },
    dueDate: { type: Date, required: true },
    submissions: [SubmissionSchema],
  },
  { timestamps: true }
);

if (mongoose.models?.Assignment) {
  delete mongoose.models.Assignment;
}

const Assignment: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;
