import { Router } from 'express';
import { WebhooksController } from './webhooks.controller';

const router = Router();
const controller = new WebhooksController();

// Public tracking routes
router.get('/track/open/:trackingId', controller.trackOpen);
router.get('/track/click/:trackingId', controller.trackClick);

// Third-party inbound webhooks
router.post('/sendgrid', controller.handleInboundEmailEvent);
router.post('/stripe', controller.handleStripeEvent);

export default router;

