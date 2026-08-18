import mongoose from 'mongoose';
import dns from 'dns';

function setFallbackDns() {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (e) {
    // Ignore fallback error
  }
}

setFallbackDns();

export const connectDB = async () => {
  setFallbackDns();
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    if (error?.code === 'ECONNREFUSED' || error?.message?.includes('querySrv')) {
      console.warn('⚠️ DNS SRV ECONNREFUSED encountered in backend. Retrying connection with Google Public DNS...');
      setFallbackDns();
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 10000,
        });
        console.log(`✅ MongoDB Connected on Retry: ${conn.connection.host}`);
        return conn;
      } catch (retryError) {
        console.error(`❌ MongoDB Connection Error on Retry: ${retryError.message}`);
        process.exit(1);
      }
    }
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
