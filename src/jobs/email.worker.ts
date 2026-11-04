import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { QUEUES } from '../constants';
import { EmailChannel } from '../modules/channels/email.channel';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const emailChannel = new EmailChannel();

export function startEmailWorker() {
  try {
    const worker = new Worker(
      QUEUES.OUTBOUND_EMAIL,
      async (job: Job) => {
        const { messageId, to, subject, html, trackingId } = job.data;
        logger.info(`[Email Worker] Processing dispatch for ${to}`);

        const result = await emailChannel.send({ to, subject, html, trackingId });

        if (result.success && messageId) {
          await prisma.outboundMessage.update({
            where: { id: messageId },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          });
        }
      },
      { connection: redisConnection }
    );

    worker.on('completed', (job) => {
      logger.info(`[Email Worker] Job ${job.id} completed successfully.`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`[Email Worker] Job ${job?.id} failed:`, err.message);
    });

    worker.on('error', () => {
      // Handled silently when redis is offline in local development
    });

    return worker;
  } catch (error: any) {
    logger.warn('Email worker initialized in passive mode:', error.message);
    return null;
  }
}

