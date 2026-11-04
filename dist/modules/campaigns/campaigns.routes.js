"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const campaigns_controller_1 = require("./campaigns.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const router = (0, express_1.Router)();
const controller = new campaigns_controller_1.CampaignsController();
const stepSchema = zod_1.z.object({
    order: zod_1.z.number().int().positive(),
    channel: zod_1.z.enum(['EMAIL', 'LINKEDIN_MESSAGE', 'LINKEDIN_CONNECT', 'CALL']),
    delayDays: zod_1.z.number().int().min(0),
    subject: zod_1.z.string().optional(),
    body: zod_1.z.string().min(1),
});
const createCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    dailySendLimit: zod_1.z.number().int().min(1).max(1000).optional(),
    steps: zod_1.z.array(stepSchema).optional(),
});
const updateCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
    dailySendLimit: zod_1.z.number().int().min(1).max(1000).optional(),
    steps: zod_1.z.array(stepSchema).optional(),
});
router.use(auth_middleware_1.authenticate);
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', (0, validate_middleware_1.validateBody)(createCampaignSchema), controller.create);
router.put('/:id', (0, validate_middleware_1.validateBody)(updateCampaignSchema), controller.update);
router.delete('/:id', controller.delete);
exports.default = router;
