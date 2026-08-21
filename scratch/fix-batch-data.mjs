import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster";

await mongoose.connect(uri);

const Batch = mongoose.model('Batch', new mongoose.Schema({}, { strict: false }));
const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }));
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

const batch1Id = new mongoose.Types.ObjectId('6a8406aaf0ce21ede442fff6'); // Batch - 01
const batch2Id = new mongoose.Types.ObjectId('6a86bd98534eae9fdc398dfa'); // Batch - 02

// 1. Update Batch 01 and Batch 02 enrolledCounts
await Batch.findByIdAndUpdate(batch1Id, { $set: { enrolledCount: 1 } });
await Batch.findByIdAndUpdate(batch2Id, { $set: { enrolledCount: 0 } });

// 2. Link enrollment to Batch 01
await Enrollment.updateMany({}, { $set: { batchId: batch1Id } });

// 3. Link order to Batch 01
await Order.updateMany({}, { $set: { batchId: batch1Id } });

console.log('✅ Successfully updated Batch counts and linked enrollment to Batch - 01!');

await mongoose.disconnect();
