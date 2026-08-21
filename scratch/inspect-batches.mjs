import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster";

await mongoose.connect(uri);

const Batch = mongoose.model('Batch', new mongoose.Schema({}, { strict: false }));
const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }));
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

const batches = await Batch.find().lean();
console.log('--- BATCHES ---');
console.log(batches.map(b => ({ id: b._id, name: b.name, courseId: b.courseId, enrolledCount: b.enrolledCount })));

const enrollments = await Enrollment.find().lean();
console.log('--- ENROLLMENTS ---');
console.log(enrollments);

const orders = await Order.find().lean();
console.log('--- ORDERS ---');
console.log(orders);

await mongoose.disconnect();
