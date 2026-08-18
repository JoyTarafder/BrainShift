import mongoose from 'mongoose';
import dns from 'dns';

function setFallbackDns() {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (e) {
    // Ignore in environments restricting DNS mutation
  }
}

// Initial DNS setup
setFallbackDns();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  setFallbackDns();

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached!.promise = (async () => {
      try {
        setFallbackDns();
        const instance = await mongoose.connect(MONGODB_URI!, opts);
        console.log('Successfully connected to MongoDB Atlas (TutorNova Cluster)');
        return instance;
      } catch (err: any) {
        if (err?.code === 'ECONNREFUSED' || err?.message?.includes('querySrv')) {
          console.warn('DNS SRV ECONNREFUSED encountered. Retrying MongoDB Atlas connection with Google Public DNS...');
          setFallbackDns();
          const instance = await mongoose.connect(MONGODB_URI!, opts);
          console.log('Successfully connected to MongoDB Atlas on retry!');
          return instance;
        }
        throw err;
      }
    })();
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
