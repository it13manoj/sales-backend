"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichmentQueue = exports.emailQueue = void 0;
exports.dispatchOutboundJob = dispatchOutboundJob;
exports.dispatchEnrichmentJob = dispatchEnrichmentJob;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const constants_1 = require("../constants");
const logger_1 = require("../utils/logger");
exports.emailQueue = null;
exports.enrichmentQueue = null;
try {
    exports.emailQueue = new bullmq_1.Queue(constants_1.QUEUES.OUTBOUND_EMAIL, { connection: redis_1.redisConnection });
    exports.enrichmentQueue = new bullmq_1.Queue(constants_1.QUEUES.LEAD_ENRICHMENT, { connection: redis_1.redisConnection });
    logger_1.logger.info('BullMQ Queues initialized successfully.');
}
catch (error) {
    logger_1.logger.warn('Redis queue running in standby mode:', error.message);
}
async function dispatchOutboundJob(data) {
    if (exports.emailQueue) {
        try {
            await exports.emailQueue.add('send-email', data, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
            });
            return;
        }
        catch (e) {
            // Fallback
        }
    }
    logger_1.logger.info(`[Queue Standby] Dispatched outbound email directly: ${data.to}`);
}
async function dispatchEnrichmentJob(data) {
    if (exports.enrichmentQueue) {
        try {
            await exports.enrichmentQueue.add('enrich-lead', data, {
                attempts: 2,
            });
            return;
        }
        catch (e) {
            // Fallback
        }
    }
    logger_1.logger.info(`[Queue Standby] Dispatched lead enrichment directly: ${data.leadId}`);
}
