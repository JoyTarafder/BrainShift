import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const uri = "mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster";

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, bufferCommands: false });

const Batch = mongoose.model('Batch', new mongoose.Schema({}, { strict: false }));
const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }));
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

const student = await User.findOne({ email: 'poked30693@hutdot.com' }).lean();
console.log('Student ID:', student._id);

const enrollment = await Enrollment.findOne({ studentId: student._id }).lean();
console.log('Enrollment Batch ID:', enrollment?.batchId);

let batch = null;
if (enrollment?.batchId) {
  batch = await Batch.findById(enrollment.batchId).lean();
}

console.log('Fetched Batch Name:', batch?.name);
console.log('Fetched Meet URL:', batch?.meetUrl);

await mongoose.disconnect();
