import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const uri = "mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster";

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, bufferCommands: false });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

const users = await User.find({}, { password: 0 }).lean();
console.log('--- ALL USERS IN DB ---');
console.log(users);

await mongoose.disconnect();
