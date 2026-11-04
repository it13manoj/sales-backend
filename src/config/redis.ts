import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

let hasLoggedOfflineWarning = false;

export const redisConnection = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 2) {
      if (!hasLoggedOfflineWarning) {
        console.log('ℹ️ Redis is offline or not installed locally. Queue workers will operate in direct/passive mode.');
        hasLoggedOfflineWarning = true;
      }
      return null; // Stop retrying to avoid console flooding
    }
    return 1000;
  },
});

redisConnection.on('connect', () => {
  console.log('✅ Connected to Redis successfully.');
});

redisConnection.on('error', (err: any) => {
  if (!hasLoggedOfflineWarning) {
    console.log('ℹ️ Redis is offline or not installed locally. Queue workers will operate in direct/passive mode.');
    hasLoggedOfflineWarning = true;
  }
});
