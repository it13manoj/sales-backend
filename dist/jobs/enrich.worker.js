"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEnrichWorker = startEnrichWorker;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const constants_1 = require("../constants");
const enrichment_service_1 = require("../modules/enrichment/enrichment.service");
const logger_1 = require("../utils/logger");
const enrichmentService = new enrichment_service_1.EnrichmentService();
function startEnrichWorker() {
    try {
        const worker = new bullmq_1.Worker(constants_1.QUEUES.LEAD_ENRICHMENT, async (job) => {
            const { leadId, organizationId } = job.data;
            logger_1.logger.info(`[Enrich Worker] Enriching lead ID ${leadId}`);
            await enrichmentService.enrichLead(leadId, organizationId);
        }, { connection: redis_1.redisConnection });
        worker.on('completed', (job) => {
            logger_1.logger.info(`[Enrich Worker] Lead enrichment job ${job.id} done.`);
        });
        worker.on('failed', (job, err) => {
            logger_1.logger.error(`[Enrich Worker] Job ${job?.id} failed:`, err.message);
        });
        worker.on('error', () => {
            // Handled silently when redis is offline in local development
        });
        return worker;
    }
    catch (error) {
        logger_1.logger.warn('Enrichment worker passive:', error.message);
        return null;
    }
}
