"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const database_1 = require("../../config/database");
const logger_1 = require("../../utils/logger");
// 1x1 transparent GIF buffer for open pixel tracking
const TRACKING_PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
class WebhooksController {
    async trackOpen(req, res) {
        const trackingId = req.params.trackingId;
        try {
            const message = await database_1.prisma.outboundMessage.findUnique({
                where: { trackingId },
                include: { lead: true },
            });
            if (message) {
                if (!message.openedAt) {
                    await database_1.prisma.outboundMessage.update({
                        where: { id: message.id },
                        data: {
                            status: 'OPENED',
                            openedAt: new Date(),
                        },
                    });
                    await database_1.prisma.lead.update({
                        where: { id: message.leadId },
                        data: { status: 'OPENED' },
                    });
                    logger_1.logger.info(`👁️ Email open recorded for lead ${message.lead.email} (TrackingId: ${trackingId})`);
                }
            }
        }
        catch (err) {
            logger_1.logger.error('Error handling trackOpen webhook:', err.message);
        }
        res.writeHead(200, {
            'Content-Type': 'image/gif',
            'Content-Length': TRACKING_PIXEL.length,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
        res.end(TRACKING_PIXEL);
    }
    async trackClick(req, res) {
        const trackingId = req.params.trackingId;
        const targetUrl = req.query.url || 'https://outboundsales.io';
        try {
            const message = await database_1.prisma.outboundMessage.findUnique({
                where: { trackingId },
            });
            if (message) {
                await database_1.prisma.outboundMessage.update({
                    where: { id: message.id },
                    data: {
                        status: 'CLICKED',
                        clickedAt: new Date(),
                    },
                });
            }
        }
        catch (err) {
            logger_1.logger.error('Error handling trackClick webhook:', err.message);
        }
        res.redirect(targetUrl);
    }
    async handleInboundEmailEvent(req, res) {
        const events = Array.isArray(req.body) ? req.body : [req.body];
        logger_1.logger.info(`Inbound SendGrid/Mailgun webhook received ${events.length} events`);
        for (const event of events) {
            logger_1.logger.info(`Webhook event: ${event.event || event.type} for ${event.email}`);
        }
        res.status(200).json({ received: true });
    }
    async handleStripeEvent(req, res) {
        logger_1.logger.info(`Inbound Stripe billing webhook: ${req.body.type || 'unknown'}`);
        res.status(200).json({ received: true });
    }
}
exports.WebhooksController = WebhooksController;
