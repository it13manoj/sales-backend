"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentController = void 0;
const enrichment_service_1 = require("./enrichment.service");
const apollo_service_1 = require("./apollo.service");
const enrichmentService = new enrichment_service_1.EnrichmentService();
const apolloService = new apollo_service_1.ApolloService();
class EnrichmentController {
    // Existing enrichment methods
    async enrich(req, res, next) {
        try {
            const leadId = req.params.leadId;
            const result = await enrichmentService.enrichLead(leadId, req.user.organizationId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async batchEnrich(req, res, next) {
        try {
            const { leadIds } = req.body;
            if (!Array.isArray(leadIds) || leadIds.length === 0) {
                return res.status(400).json({ success: false, message: 'leadIds array is required' });
            }
            const results = await enrichmentService.batchEnrich(leadIds, req.user.organizationId);
            res.json({ success: true, data: results, count: results.length });
        }
        catch (error) {
            next(error);
        }
    }
    async testDomain(req, res, next) {
        try {
            const { input } = req.body;
            if (!input) {
                return res.status(400).json({ success: false, message: 'Domain or email input is required' });
            }
            const result = await enrichmentService.testDomainOrEmail(input);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async getEngineStatus(req, res, next) {
        try {
            const status = enrichmentService.getEngineStatus();
            res.json({ success: true, data: status });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyEmail(req, res, next) {
        try {
            const { email } = req.body;
            const result = await enrichmentService.testDomainOrEmail(email);
            res.json({
                success: true,
                data: {
                    email,
                    domain: result.domain,
                    status: result.isDeliverable ? 'deliverable' : 'undeliverable',
                    score: result.icpScore,
                    mailProvider: result.mailProvider,
                    mxRecords: result.mxRecords.length > 0,
                    spfCheck: result.spfValid,
                    dmarcCheck: result.dmarcValid,
                    disposable: result.isDisposable,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // ==========================================
    // Full Apollo Live Endpoints
    // ==========================================
    // 1. People API Search
    async searchApolloPeople(req, res, next) {
        try {
            const { qKeywords, qOrganizationDomains, personTitles, personLocations, page, perPage } = req.body;
            const result = await apolloService.searchPeople({
                qKeywords,
                qOrganizationDomains,
                personTitles,
                personLocations,
                page: page ? Number(page) : 1,
                perPage: perPage ? Number(perPage) : 15,
            });
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // 2. People Enrichment
    async enrichApolloPerson(req, res, next) {
        try {
            const { id, firstName, lastName, email, domain, companyName } = req.body;
            const result = await apolloService.enrichPerson({ id, firstName, lastName, email, domain, companyName });
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // 3. Organization Search
    async searchApolloOrganizations(req, res, next) {
        try {
            const { qName, keywordTags, employeeRanges, page, perPage } = req.body;
            const result = await apolloService.searchOrganizations({
                qName,
                keywordTags,
                employeeRanges,
                page: page ? Number(page) : 1,
                perPage: perPage ? Number(perPage) : 15,
            });
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // 4. Organization Enrichment
    async enrichApolloOrganization(req, res, next) {
        try {
            const domain = req.query.domain || req.body.domain;
            if (!domain) {
                return res.status(400).json({ success: false, message: 'Domain is required' });
            }
            const result = await apolloService.enrichOrganization(domain);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // 5. Bulk People Enrichment
    async bulkEnrichApolloPeople(req, res, next) {
        try {
            const { details } = req.body;
            if (!Array.isArray(details) || details.length === 0) {
                return res.status(400).json({ success: false, message: 'details array is required' });
            }
            const result = await apolloService.bulkEnrichPeople(details);
            res.json({ success: true, data: result, count: result.length });
        }
        catch (error) {
            next(error);
        }
    }
    // 6. Create Contact in Apollo
    async createApolloContact(req, res, next) {
        try {
            const { firstName, lastName, title, email, organizationName, phone } = req.body;
            if (!firstName || !email) {
                return res.status(400).json({ success: false, message: 'firstName and email are required' });
            }
            const contact = await apolloService.createContact({ firstName, lastName, title, email, organizationName, phone });
            res.json({ success: true, data: contact });
        }
        catch (error) {
            next(error);
        }
    }
    // 7. Apollo Sequences
    async listApolloSequences(req, res, next) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const perPage = req.query.perPage ? Number(req.query.perPage) : 20;
            const sequences = await apolloService.listSequences({ page, perPage });
            res.json({ success: true, data: sequences });
        }
        catch (error) {
            next(error);
        }
    }
    async createApolloSequence(req, res, next) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Sequence name is required' });
            }
            const sequence = await apolloService.createSequence(name);
            res.json({ success: true, data: sequence });
        }
        catch (error) {
            next(error);
        }
    }
    async addContactsToApolloSequence(req, res, next) {
        try {
            const { sequenceId } = req.params;
            const { contactIds } = req.body;
            if (!Array.isArray(contactIds) || contactIds.length === 0) {
                return res.status(400).json({ success: false, message: 'contactIds array is required' });
            }
            const result = await apolloService.addContactsToSequence(sequenceId, contactIds);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // Import directly into platform's MySQL Lead table!
    async importApolloPersonToLeads(req, res, next) {
        try {
            const { personId, firstName, lastName, email, domain, companyName, campaignId } = req.body;
            const lead = await apolloService.importPersonToLeads({
                personId,
                firstName,
                lastName,
                email,
                domain,
                companyName,
                organizationId: req.user.organizationId,
                campaignId,
            });
            res.json({ success: true, data: lead });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EnrichmentController = EnrichmentController;
