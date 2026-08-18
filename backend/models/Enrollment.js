import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    enrolledAt: { type: Date, default: Date.now },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment for same student and course
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);

export default Enrollment;
