import mongoose from 'mongoose';
import dns from 'dns';

// Fix DNS SRV lookup issues on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster";

console.log('Testing connection to MongoDB Atlas with Google DNS fallback...');
try {
  await mongoose.connect(uri);
  console.log('✅ Successfully connected to MongoDB Atlas!');
  console.log('Host:', mongoose.connection.host);
  console.log('Database Name:', mongoose.connection.name);
  await mongoose.disconnect();
} catch (err) {
  console.error('❌ Connection failed:', err);
}
