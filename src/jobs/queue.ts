import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { QUEUES } from '../constants';
import { logger } from '../utils/logger';

export let emailQueue: Queue | null = null;
export let enrichmentQueue: Queue | null = null;

try {
  emailQueue = new Queue(QUEUES.OUTBOUND_EMAIL, { connection: redisConnection });
  enrichmentQueue = new Queue(QUEUES.LEAD_ENRICHMENT, { connection: redisConnection });
  logger.info('BullMQ Queues initialized successfully.');
} catch (error: any) {
  logger.warn('Redis queue running in standby mode:', error.message);
}

export async function dispatchOutboundJob(data: any) {
  if (emailQueue) {
    try {
      await emailQueue.add('send-email', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
      return;
    } catch (e) {
      // Fallback
    }
  }
  logger.info(`[Queue Standby] Dispatched outbound email directly: ${data.to}`);
}

export async function dispatchEnrichmentJob(data: any) {
  if (enrichmentQueue) {
    try {
      await enrichmentQueue.add('enrich-lead', data, {
        attempts: 2,
      });
      return;
    } catch (e) {
      // Fallback
    }
  }
  logger.info(`[Queue Standby] Dispatched lead enrichment directly: ${data.leadId}`);
}

