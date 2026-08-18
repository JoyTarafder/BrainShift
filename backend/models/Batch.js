import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
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

const Batch = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);

export default Batch;
