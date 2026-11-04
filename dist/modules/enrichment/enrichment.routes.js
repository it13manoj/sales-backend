"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const enrichment_controller_1 = require("./enrichment.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const router = (0, express_1.Router)();
const controller = new enrichment_controller_1.EnrichmentController();
const verifyEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
const testDomainSchema = zod_1.z.object({
    input: zod_1.z.string().min(2),
});
const batchEnrichSchema = zod_1.z.object({
    leadIds: zod_1.z.array(zod_1.z.string().min(1)),
});
router.use(auth_middleware_1.authenticate);
// Engine status and capabilities
router.get('/engine-status', controller.getEngineStatus);
// Live test playground for domain or email (zero-key or apollo)
router.post('/test-domain', (0, validate_middleware_1.validateBody)(testDomainSchema), controller.testDomain);
// Lead enrichment endpoints
router.post('/batch-enrich', (0, validate_middleware_1.validateBody)(batchEnrichSchema), controller.batchEnrich);
router.post('/:leadId/enrich', controller.enrich);
router.post('/verify-email', (0, validate_middleware_1.validateBody)(verifyEmailSchema), controller.verifyEmail);
// ==========================================
// Full Apollo Endpoints
// ==========================================
// 1. People API Search: Find people using filters
router.post('/apollo/people/search', controller.searchApolloPeople);
// 2. People Enrichment: Get additional information about a person
router.post('/apollo/people/enrich', controller.enrichApolloPerson);
// 3. Organization Search: Find companies
router.post('/apollo/organizations/search', controller.searchApolloOrganizations);
// 4. Organization Enrichment: Get company details
router.get('/apollo/organizations/enrich', controller.enrichApolloOrganization);
router.post('/apollo/organizations/enrich', controller.enrichApolloOrganization);
// 5. Bulk People Enrichment: Enrich multiple people
router.post('/apollo/people/bulk-enrich', controller.bulkEnrichApolloPeople);
// 6. Create Contact: Save a person in Apollo
router.post('/apollo/contacts/create', controller.createApolloContact);
// 7. Sequences: Manage sales outreach in Apollo
router.get('/apollo/sequences', controller.listApolloSequences);
router.post('/apollo/sequences', controller.createApolloSequence);
router.post('/apollo/sequences/:sequenceId/add-contacts', controller.addContactsToApolloSequence);
// Import Apollo candidate directly to Platform Leads database
router.post('/apollo/people/import-lead', controller.importApolloPersonToLeads);
exports.default = router;
