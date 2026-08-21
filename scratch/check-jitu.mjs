import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const uri = "mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster";

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, bufferCommands: false });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

const student = await User.findOne({ email: 'poked30693@hutdot.com' }).lean();
console.log('Student Jitu:', student);

if (student) {
  console.log('Password hash length:', student.password.length);
  console.log('Password hash start:', student.password.substring(0, 15));
}

await mongoose.disconnect();
