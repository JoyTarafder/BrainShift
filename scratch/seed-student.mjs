import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const uri = "mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster";

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, bufferCommands: false });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

const salt = await bcrypt.genSalt(10);
const newHashedPassword = await bcrypt.hash('Student@123456', salt);

// 1. Reset password for Jitu (poked30693@hutdot.com)
const jitu = await User.findOneAndUpdate(
  { email: 'poked30693@hutdot.com' },
  { $set: { password: newHashedPassword, role: 'student' } },
  { new: true }
);

console.log('✅ Jitu password updated to "Student@123456"!');

// 2. Ensure test student account student@tutornova.com exists
const testStudent = await User.findOneAndUpdate(
  { email: 'student@tutornova.com' },
  {
    $set: {
      name: 'Student Demo Account',
      email: 'student@tutornova.com',
      password: newHashedPassword,
      role: 'student'
    }
  },
  { upsert: true, new: true }
);

console.log('✅ Demo Student (student@tutornova.com) updated/created with password "Student@123456"!');

await mongoose.disconnect();
