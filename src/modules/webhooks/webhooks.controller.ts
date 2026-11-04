import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

// 1x1 transparent GIF buffer for open pixel tracking
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export class WebhooksController {
  async trackOpen(req: Request, res: Response) {
    const trackingId = req.params.trackingId as string;

    try {
      const message = await prisma.outboundMessage.findUnique({
        where: { trackingId },
        include: { lead: true },
      });

      if (message) {
        if (!message.openedAt) {
          await prisma.outboundMessage.update({
            where: { id: message.id },
            data: {
              status: 'OPENED',
              openedAt: new Date(),
            },
          });

          await prisma.lead.update({
            where: { id: message.leadId },
            data: { status: 'OPENED' },
          });

          logger.info(`👁️ Email open recorded for lead ${message.lead.email} (TrackingId: ${trackingId})`);
        }
      }
    } catch (err: any) {
      logger.error('Error handling trackOpen webhook:', err.message);
    }

    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': TRACKING_PIXEL.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(TRACKING_PIXEL);
  }

  async trackClick(req: Request, res: Response) {
    const trackingId = req.params.trackingId as string;
    const targetUrl = (req.query.url as string) || 'https://outboundsales.io';

    try {
      const message = await prisma.outboundMessage.findUnique({
        where: { trackingId },
      });

      if (message) {
        await prisma.outboundMessage.update({
          where: { id: message.id },
          data: {
            status: 'CLICKED',
            clickedAt: new Date(),
          },
        });
      }
    } catch (err: any) {
      logger.error('Error handling trackClick webhook:', err.message);
    }

    res.redirect(targetUrl);
  }

  async handleInboundEmailEvent(req: Request, res: Response) {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    logger.info(`Inbound SendGrid/Mailgun webhook received ${events.length} events`);

    for (const event of events) {
      logger.info(`Webhook event: ${event.event || event.type} for ${event.email}`);
    }

    res.status(200).json({ received: true });
  }

  async handleStripeEvent(req: Request, res: Response) {
    logger.info(`Inbound Stripe billing webhook: ${req.body.type || 'unknown'}`);
    res.status(200).json({ received: true });
  }
}
