import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongodInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meditrack';

  try {
    // Attempt standard connection first with a 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database]: MongoDB connected successfully to ${uri}`);
  } catch (err) {
    console.warn(`[Database]: Direct MongoDB connection to ${uri} failed: ${err.message}`);
    console.log('[Database]: Initializing in-memory MongoDB fallback server...');
    
    try {
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database]: In-memory MongoDB running at: ${inMemoryUri}`);
    } catch (memErr) {
      console.error('[Database]: Critical Failure: Unable to connect to MongoDB or start fallback:', memErr);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
