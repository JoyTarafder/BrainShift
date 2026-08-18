import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const MONGODB_URI = "mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster";

async function fixOrdersIndex() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;
    const ordersColl = db.collection('orders');

    // 1. Delete any orders where transactionId is null
    const deleteResult = await ordersColl.deleteMany({ transactionId: null });
    console.log(`Deleted ${deleteResult.deletedCount} orders with transactionId: null`);

    // 2. Drop the transactionId_1 index if it exists so Mongoose can rebuild it cleanly
    try {
      await ordersColl.dropIndex('transactionId_1');
      console.log('Successfully dropped old transactionId_1 index');
    } catch (indexErr) {
      console.log('Note on index drop:', indexErr.message);
    }

    console.log('Database index cleanup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing orders index:', err);
    process.exit(1);
  }
}

fixOrdersIndex();
