import mongoose from 'mongoose';

const MarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
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

const Mark = mongoose.models.Mark || mongoose.model('Mark', MarkSchema);
export default Mark;
