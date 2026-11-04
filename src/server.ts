import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import { startEmailWorker } from './jobs/email.worker';
import { startEnrichWorker } from './jobs/enrich.worker';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT) || 4000;

async function bootstrap() {
  try {
    // 1. Connect to MySQL Database
    await connectDatabase();

    // 2. Start Background Queue Workers
    startEmailWorker();
    startEnrichWorker();

    // 3. Start HTTP Server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Outbound Sales Platform Backend running on port ${PORT}`);
      logger.info(`👉 API Base URL: http://localhost:${PORT}/api`);
      logger.info(`👉 Health Check: http://localhost:${PORT}/health`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`⚠️ Port ${PORT} is already in use. Please free port ${PORT} or restart.`);
      } else {
        logger.error('Server error:', err);
      }
    });
  } catch (error: any) {
    logger.error('Fatal initialization error:', error.message);
    process.exit(1);
  }
}

bootstrap();

