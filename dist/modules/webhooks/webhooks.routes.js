"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhooks_controller_1 = require("./webhooks.controller");
const router = (0, express_1.Router)();
const controller = new webhooks_controller_1.WebhooksController();
// Public tracking routes
router.get('/track/open/:trackingId', controller.trackOpen);
router.get('/track/click/:trackingId', controller.trackClick);
// Third-party inbound webhooks
router.post('/sendgrid', controller.handleInboundEmailEvent);
router.post('/stripe', controller.handleStripeEvent);
exports.default = router;
