import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster';

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: String,
    description: String,
    subject: String,
    level: String,
    price: Number,
    oldPrice: Number,
    enrollmentOpen: { type: Boolean, default: true },
    batchInfo: String,
    thumbnailUrl: String,
    duration: String,
    syllabus: [String],
    modules: [
      {
        title: String,
        type: { type: String, enum: ['video', 'pdf', 'link'], default: 'video' },
        url: String,
        durationMinutes: Number,
      },
    ],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function fixEnrollmentOpen() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const result = await Course.updateMany(
    { enrollmentOpen: { $exists: false } },
    { $set: { enrollmentOpen: true } }
  );

  console.log(`Updated ${result.modifiedCount} courses to set enrollmentOpen: true`);
  await mongoose.disconnect();
}

fixEnrollmentOpen().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
