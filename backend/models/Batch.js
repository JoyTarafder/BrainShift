import mongoose from 'mongoose';

const BatchMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'slide', 'note', 'video'], default: 'pdf' },
  addedAt: { type: Date, default: Date.now },
});

const BatchModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'pdf', 'link'], default: 'video' },
  url: { type: String, required: true },
  durationMinutes: { type: Number },
});

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
    meetUrl: { type: String, default: '' },
    whatsappUrl: { type: String, default: '' },
    notice: { type: String, default: '' },
    materials: [BatchMaterialSchema],
    modules: [BatchModuleSchema],
  },
  { timestamps: true, strict: false }
);

const Batch = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);

export default Batch;
