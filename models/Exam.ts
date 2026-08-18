import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMCQQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export interface IExamResult {
  _id?: string;
  studentId: mongoose.Types.ObjectId | string;
  studentName: string;
  studentEmail: string;
  score: number;
  totalMarks: number;
  answers: number[];
  submissionUrl?: string;
  notes?: string;
  passed: boolean;
  takenAt: Date;
}

export interface IExam extends Document {
  batchId: mongoose.Types.ObjectId | string;
  courseId?: mongoose.Types.ObjectId | string;
  title: string;
  type: 'online_mcq' | 'written_exam';
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  questions?: IMCQQuestion[];
  results?: IExamResult[];
  examDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MCQQuestionSchema = new Schema<IMCQQuestion>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true, default: 0 },
    explanation: { type: String, default: '' },
  },
  { _id: true }
);

const ExamResultSchema = new Schema<IExamResult>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    score: { type: Number, required: true, default: 0 },
    totalMarks: { type: Number, required: true, default: 100 },
    answers: [{ type: Number }],
    submissionUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    passed: { type: Boolean, default: false },
    takenAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ExamSchema = new Schema<IExam>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['online_mcq', 'written_exam'], default: 'online_mcq' },
    description: { type: String, default: '' },
    durationMinutes: { type: Number, default: 30 },
    totalMarks: { type: Number, default: 100 },
    passMarks: { type: Number, default: 40 },
    questions: [MCQQuestionSchema],
    results: [ExamResultSchema],
    examDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

if (mongoose.models?.Exam) {
  delete mongoose.models.Exam;
}

const Exam: Model<IExam> = mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);

export default Exam;
