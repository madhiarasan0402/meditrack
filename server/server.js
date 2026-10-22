import dns from 'node:dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);

import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';
import { seedDatabase } from './src/utils/seedData.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed if database is fresh
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap]: Database is empty. Seeding initial clinical records...');
      await seedDatabase();
    }
  } catch (seedErr) {
    console.warn('[Bootstrap Warning]: Auto-seed skipped:', seedErr.message);
  }

  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'MediTrack API is running'
    });
  });

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  MediTrack Backend Engine Live on port ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

startServer().catch(err => {
  console.error('[Fatal Server Startup Error]:', err);
  process.exit(1);
});
