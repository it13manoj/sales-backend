"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const leads_controller_1 = require("./leads.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const router = (0, express_1.Router)();
const controller = new leads_controller_1.LeadsController();
const createLeadSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    companyName: zod_1.z.string().min(1),
    companyDomain: zod_1.z.string().optional(),
    industry: zod_1.z.string().optional(),
    linkedinUrl: zod_1.z.string().url().optional(),
    campaignId: zod_1.z.string().uuid().optional(),
    score: zod_1.z.number().int().min(0).max(100).optional(),
});
const importBatchSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid().optional(),
    leads: zod_1.z.array(zod_1.z.object({
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        email: zod_1.z.string().email(),
        companyName: zod_1.z.string().min(1),
        phone: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
    })),
});
router.use(auth_middleware_1.authenticate);
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/seed-sample-leads', controller.seedSampleLeads);
router.post('/', (0, validate_middleware_1.validateBody)(createLeadSchema), controller.create);
router.post('/import-batch', (0, validate_middleware_1.validateBody)(importBatchSchema), controller.importBatch);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
exports.default = router;
