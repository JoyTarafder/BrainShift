import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster";

async function seedAdmin() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const adminEmail = 'admin@tutornova.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log(`ℹ️ Admin account (${adminEmail}) already exists.`);
  } else {
    console.log(`Creating Admin user account (${adminEmail})...`);
    await User.create({
      name: 'Joy Tarafder (Admin)',
      email: adminEmail,
      password: 'Admin@TutorNova2026',
      role: 'admin',
    });
    console.log('✅ Admin user successfully created!');
  }

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
