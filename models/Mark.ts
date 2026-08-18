import mongoose, { Schema, Document } from 'mongoose';

export interface IMark extends Document {
  studentId: mongoose.Types.ObjectId | string;
  courseId: mongoose.Types.ObjectId | string;
  examTitle: string;
  marksObtained: number;
  totalMarks: number;
  remarks: string;
  examDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MarkSchema = new Schema<IMark>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    examTitle: {
      type: String,
      required: true,
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    examDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Mark = mongoose.models.Mark || mongoose.model<IMark>('Mark', MarkSchema);
export default Mark;
