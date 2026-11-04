"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmailWorker = startEmailWorker;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const constants_1 = require("../constants");
const email_channel_1 = require("../modules/channels/email.channel");
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const emailChannel = new email_channel_1.EmailChannel();
function startEmailWorker() {
    try {
        const worker = new bullmq_1.Worker(constants_1.QUEUES.OUTBOUND_EMAIL, async (job) => {
            const { messageId, to, subject, html, trackingId } = job.data;
            logger_1.logger.info(`[Email Worker] Processing dispatch for ${to}`);
            const result = await emailChannel.send({ to, subject, html, trackingId });
            if (result.success && messageId) {
                await database_1.prisma.outboundMessage.update({
                    where: { id: messageId },
                    data: {
                        status: 'SENT',
                        sentAt: new Date(),
                    },
                });
            }
        }, { connection: redis_1.redisConnection });
        worker.on('completed', (job) => {
            logger_1.logger.info(`[Email Worker] Job ${job.id} completed successfully.`);
        });
        worker.on('failed', (job, err) => {
            logger_1.logger.error(`[Email Worker] Job ${job?.id} failed:`, err.message);
        });
        worker.on('error', () => {
            // Handled silently when redis is offline in local development
        });
        return worker;
    }
    catch (error) {
        logger_1.logger.warn('Email worker initialized in passive mode:', error.message);
        return null;
    }
}
