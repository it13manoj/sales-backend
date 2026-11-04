import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { QUEUES } from '../constants';
import { EnrichmentService } from '../modules/enrichment/enrichment.service';
import { logger } from '../utils/logger';

const enrichmentService = new EnrichmentService();

export function startEnrichWorker() {
  try {
    const worker = new Worker(
      QUEUES.LEAD_ENRICHMENT,
      async (job: Job) => {
        const { leadId, organizationId } = job.data;
        logger.info(`[Enrich Worker] Enriching lead ID ${leadId}`);
        await enrichmentService.enrichLead(leadId, organizationId);
      },
      { connection: redisConnection }
    );

    worker.on('completed', (job) => {
      logger.info(`[Enrich Worker] Lead enrichment job ${job.id} done.`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`[Enrich Worker] Job ${job?.id} failed:`, err.message);
    });

    worker.on('error', () => {
      // Handled silently when redis is offline in local development
    });

    return worker;
  } catch (error: any) {
    logger.warn('Enrichment worker passive:', error.message);
    return null;
  }
}

