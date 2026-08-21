import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const uri = "mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster";

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, bufferCommands: false });

const Batch = mongoose.model('Batch', new mongoose.Schema({}, { strict: false }));
const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }));

const batches = await Batch.find().lean();
console.log('--- ALL BATCHES ---');
console.log(batches.map(b => ({
  _id: b._id,
  name: b.name,
  meetUrl: b.meetUrl,
  whatsappUrl: b.whatsappUrl,
  createdAt: b.createdAt
})));

const enrollments = await Enrollment.find().lean();
console.log('--- ENROLLMENTS ---');
console.log(enrollments);

await mongoose.disconnect();
