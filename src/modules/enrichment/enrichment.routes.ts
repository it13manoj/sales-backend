import { Router } from 'express';
import { z } from 'zod';
import { EnrichmentController } from './enrichment.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';

const router = Router();
const controller = new EnrichmentController();

const verifyEmailSchema = z.object({
  email: z.string().email(),
});

const testDomainSchema = z.object({
  input: z.string().min(2),
});

const batchEnrichSchema = z.object({
  leadIds: z.array(z.string().min(1)),
});

router.use(authenticate);

// Engine status and capabilities
router.get('/engine-status', controller.getEngineStatus as any);

// Live test playground for domain or email (zero-key or apollo)
router.post('/test-domain', validateBody(testDomainSchema), controller.testDomain as any);

// Lead enrichment endpoints
router.post('/batch-enrich', validateBody(batchEnrichSchema), controller.batchEnrich as any);
router.post('/:leadId/enrich', controller.enrich as any);
router.post('/verify-email', validateBody(verifyEmailSchema), controller.verifyEmail as any);

// ==========================================
// Full Apollo Endpoints
// ==========================================
// 1. People API Search: Find people using filters
router.post('/apollo/people/search', controller.searchApolloPeople as any);

// 2. People Enrichment: Get additional information about a person
router.post('/apollo/people/enrich', controller.enrichApolloPerson as any);

// 3. Organization Search: Find companies
router.post('/apollo/organizations/search', controller.searchApolloOrganizations as any);

// 4. Organization Enrichment: Get company details
router.get('/apollo/organizations/enrich', controller.enrichApolloOrganization as any);
router.post('/apollo/organizations/enrich', controller.enrichApolloOrganization as any);

// 5. Bulk People Enrichment: Enrich multiple people
router.post('/apollo/people/bulk-enrich', controller.bulkEnrichApolloPeople as any);

// 6. Create Contact: Save a person in Apollo
router.post('/apollo/contacts/create', controller.createApolloContact as any);

// 7. Sequences: Manage sales outreach in Apollo
router.get('/apollo/sequences', controller.listApolloSequences as any);
router.post('/apollo/sequences', controller.createApolloSequence as any);
router.post('/apollo/sequences/:sequenceId/add-contacts', controller.addContactsToApolloSequence as any);

// Import Apollo candidate directly to Platform Leads database
router.post('/apollo/people/import-lead', controller.importApolloPersonToLeads as any);

export default router;
