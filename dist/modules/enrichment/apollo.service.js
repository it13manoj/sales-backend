"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloService = void 0;
const database_1 = require("../../config/database");
const providers_1 = require("../../config/providers");
const logger_1 = require("../../utils/logger");
const enrichment_service_1 = require("./enrichment.service");
const enrichmentService = new enrichment_service_1.EnrichmentService();
class ApolloService {
    apiKey;
    baseUrl = 'https://api.apollo.io/v1';
    constructor() {
        this.apiKey = process.env.APOLLO_API_KEY || providers_1.PROVIDERS_CONFIG.apollo.apiKey;
    }
    getHeaders() {
        return {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        };
    }
    /**
     * 1. People API Search: Find people using filters
     */
    async searchPeople(params) {
        const payload = {
            page: params.page || 1,
            per_page: Math.min(params.perPage || 15, 50),
        };
        if (params.qKeywords)
            payload.q_keywords = params.qKeywords;
        if (params.qOrganizationDomains)
            payload.q_organization_domains = params.qOrganizationDomains;
        if (params.personTitles && params.personTitles.length > 0)
            payload.person_titles = params.personTitles;
        if (params.personLocations && params.personLocations.length > 0)
            payload.person_locations = params.personLocations;
        try {
            const res = await fetch(`${this.baseUrl}/mixed_people/api_search`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Apollo People Search error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            return {
                totalEntries: data.total_entries || data.pagination?.total_entries || (data.people?.length || 0),
                page: data.pagination?.page || payload.page,
                perPage: data.pagination?.per_page || payload.per_page,
                people: (data.people || []).map((p) => ({
                    id: p.id,
                    firstName: p.first_name,
                    lastName: p.last_name_obfuscated || p.last_name || '',
                    title: p.title,
                    hasEmail: Boolean(p.has_email),
                    hasDirectPhone: Boolean(p.has_direct_phone === 'Yes' || p.has_direct_phone === true),
                    organization: {
                        name: p.organization?.name || 'Company',
                        hasIndustry: p.organization?.has_industry,
                        hasEmployeeCount: p.organization?.has_employee_count,
                        hasRevenue: p.organization?.has_revenue,
                    },
                })),
            };
        }
        catch (err) {
            logger_1.logger.error('Apollo searchPeople error:', err.message);
            throw { status: 502, message: err.message };
        }
    }
    /**
     * 2. People Enrichment: Get additional information about a person
     */
    async enrichPerson(params) {
        const payload = {};
        if (params.id)
            payload.id = params.id;
        if (params.firstName)
            payload.first_name = params.firstName;
        if (params.lastName)
            payload.last_name = params.lastName;
        if (params.email)
            payload.email = params.email;
        if (params.domain)
            payload.domain = params.domain;
        if (params.companyName)
            payload.organization_name = params.companyName;
        try {
            const res = await fetch(`${this.baseUrl}/people/match`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Apollo Person Match error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            if (!data.person) {
                return null;
            }
            const p = data.person;
            return {
                id: p.id,
                name: p.name,
                firstName: p.first_name,
                lastName: p.last_name,
                email: p.email,
                title: p.title,
                seniority: p.seniority,
                linkedinUrl: p.linkedin_url,
                phone: p.sanitized_phone || p.phone_numbers?.[0]?.sanitized_number || null,
                city: p.city,
                state: p.state,
                country: p.country,
                organization: p.organization
                    ? {
                        id: p.organization.id,
                        name: p.organization.name,
                        websiteUrl: p.organization.website_url,
                        logoUrl: p.organization.logo_url,
                        linkedinUrl: p.organization.linkedin_url,
                        industry: p.organization.industry,
                        estimatedNumEmployees: p.organization.estimated_num_employees,
                    }
                    : null,
            };
        }
        catch (err) {
            logger_1.logger.error('Apollo enrichPerson error:', err.message);
            throw { status: 502, message: err.message };
        }
    }
    /**
     * 3. Organization Search: Find companies with keyword, industry, employee filters
     */
    async searchOrganizations(params) {
        const payload = {
            page: params.page || 1,
            per_page: Math.min(params.perPage || 15, 50),
        };
        if (params.qName)
            payload.q_organization_name = params.qName;
        if (params.keywordTags && params.keywordTags.length > 0)
            payload.q_organization_keyword_tags = params.keywordTags;
        if (params.employeeRanges && params.employeeRanges.length > 0)
            payload.organization_num_employees_ranges = params.employeeRanges;
        try {
            const res = await fetch(`${this.baseUrl}/mixed_companies/search`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Apollo Org Search error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            return {
                totalEntries: data.pagination?.total_entries || data.total_entries || (data.organizations?.length || 0),
                page: data.pagination?.page || payload.page,
                perPage: data.pagination?.per_page || payload.per_page,
                organizations: (data.organizations || []).map((org) => ({
                    id: org.id,
                    name: org.name,
                    websiteUrl: org.website_url,
                    logoUrl: org.logo_url,
                    linkedinUrl: org.linkedin_url,
                    twitterUrl: org.twitter_url,
                    primaryPhone: org.primary_phone?.sanitized_number || null,
                    industry: org.industry,
                    estimatedNumEmployees: org.estimated_num_employees,
                    foundedYear: org.founded_year,
                    city: org.city,
                    state: org.state,
                    country: org.country,
                    keywords: org.keywords ? org.keywords.slice(0, 6) : [],
                })),
            };
        }
        catch (err) {
            logger_1.logger.error('Apollo searchOrganizations error:', err.message);
            throw { status: 502, message: err.message };
        }
    }
    /**
     * 4. Organization Enrichment: Get company details by domain
     */
    async enrichOrganization(domain) {
        const cleanDomain = enrichmentService.extractDomain(domain);
        try {
            const res = await fetch(`${this.baseUrl}/organizations/enrich?domain=${encodeURIComponent(cleanDomain)}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Apollo Org Enrich error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            if (!data.organization) {
                return null;
            }
            const org = data.organization;
            return {
                id: org.id,
                name: org.name,
                websiteUrl: org.website_url,
                logoUrl: org.logo_url,
                linkedinUrl: org.linkedin_url,
                industry: org.industry,
                estimatedNumEmployees: org.estimated_num_employees,
                rawAddress: org.raw_address,
                city: org.city,
                state: org.state,
                country: org.country,
                foundedYear: org.founded_year,
                totalFunding: org.total_funding,
                totalFundingPrinted: org.total_funding_printed,
                latestFundingStage: org.latest_funding_stage,
                technologies: (org.technology_names || []).slice(0, 15),
                keywords: (org.keywords || []).slice(0, 8),
            };
        }
        catch (err) {
            logger_1.logger.error('Apollo enrichOrganization error:', err.message);
            throw { status: 502, message: err.message };
        }
    }
    /**
     * 5. Bulk People Enrichment: Enrich multiple people at once
     */
    async bulkEnrichPeople(details) {
        const mapped = details.map((d) => ({
            first_name: d.firstName,
            last_name: d.lastName,
            email: d.email,
            domain: d.domain,
        }));
        try {
            const res = await fetch(`${this.baseUrl}/people/bulk_match`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ details: mapped }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Apollo Bulk Match error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            return (data.matches || []).map((m) => ({
                id: m.id,
                name: m.name,
                firstName: m.first_name,
                lastName: m.last_name,
                email: m.email,
                title: m.title,
                seniority: m.seniority,
                linkedinUrl: m.linkedin_url,
                organizationName: m.organization?.name,
                organizationDomain: m.organization?.website_url,
            }));
        }
        catch (err) {
            logger_1.logger.error('Apollo bulkEnrichPeople error:', err.message);
            throw { status: 502, message: err.message };
        }
    }
    /**
     * 6. Create Contact: Save a person/contact in Apollo
     */
    async createContact(contact) {
        const payload = {
            first_name: contact.firstName,
            last_name: contact.lastName,
            email: contact.email,
        };
        if (contact.title)
            payload.title = contact.title;
        if (contact.organizationName)
            payload.organization_name = contact.organizationName;
        if (contact.phone)
            payload.phone = contact.phone;
        try {
            const res = await fetch(`${this.baseUrl}/contacts`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Apollo Create Contact error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            return data.contact;
        }
        catch (err) {
            logger_1.logger.error('Apollo createContact error:', err.message);
            throw { status: 502, message: err.message };
        }
    }
    /**
     * 7. Sequences: Manage Apollo sales outreach sequences
     */
    async listSequences(params) {
        try {
            const res = await fetch(`${this.baseUrl}/emailer_campaigns/search`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    page: params?.page || 1,
                    per_page: params?.perPage || 20,
                }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Apollo List Sequences error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            return (data.emailer_campaigns || []).map((seq) => ({
                id: seq.id,
                name: seq.name,
                active: seq.active,
                numSteps: seq.num_steps || 0,
                userId: seq.user_id,
                createdAt: seq.created_at,
                archived: seq.archived,
            }));
        }
        catch (err) {
            logger_1.logger.error('Apollo listSequences error:', err.message);
            throw { status: 502, message: err.message };
        }
    }
    async createSequence(name) {
        try {
            const res = await fetch(`${this.baseUrl}/emailer_campaigns`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ name }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Apollo Create Sequence error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            return data.emailer_campaign;
        }
        catch (err) {
            logger_1.logger.error('Apollo createSequence error:', err.message);
            throw { status: 502, message: err.message };
        }
    }
    async addContactsToSequence(sequenceId, contactIds) {
        try {
            const res = await fetch(`${this.baseUrl}/emailer_campaigns/${sequenceId}/add_contact_ids`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ contact_ids: contactIds }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Apollo Add Contact to Sequence error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            return data;
        }
        catch (err) {
            logger_1.logger.error('Apollo addContactsToSequence error:', err.message);
            throw { status: 502, message: err.message };
        }
    }
    /**
     * Import person from Apollo directly into our platform's Leads database!
     */
    async importPersonToLeads(params) {
        // 1. Get enriched details from Apollo
        const apolloPerson = await this.enrichPerson(params);
        if (!apolloPerson || !apolloPerson.email) {
            throw new Error('Unable to resolve person email from Apollo for lead creation.');
        }
        const domain = enrichmentService.extractDomain(params.domain || apolloPerson.organization?.websiteUrl || apolloPerson.email.split('@')[1]);
        // 2. Run DNS MX intelligence
        const dnsData = await enrichmentService.resolveDnsIntelligence(domain);
        // 3. Upsert into database
        const lead = await database_1.prisma.lead.upsert({
            where: {
                organizationId_email: {
                    organizationId: params.organizationId,
                    email: apolloPerson.email,
                },
            },
            update: {
                firstName: apolloPerson.firstName || params.firstName || 'Lead',
                lastName: apolloPerson.lastName || params.lastName || '',
                title: apolloPerson.title || 'Executive',
                companyName: apolloPerson.organization?.name || params.companyName || 'Company',
                companyDomain: domain,
                phone: apolloPerson.phone,
                linkedinUrl: apolloPerson.linkedinUrl,
                industry: apolloPerson.organization?.industry || 'B2B Software',
                enriched: true,
                score: 95,
                customFields: {
                    ...dnsData,
                    domain,
                    mailProvider: dnsData.mailProvider,
                    logoUrl: apolloPerson.organization?.logoUrl || `https://logo.clearbit.com/${domain}`,
                    employeeRange: `${apolloPerson.organization?.estimatedNumEmployees || 250} Employees`,
                    headquarters: `${apolloPerson.city || ''}, ${apolloPerson.country || ''}`.trim(),
                    seniorityLevel: apolloPerson.seniority || 'Director',
                    apolloVerified: true,
                    dataSource: 'Apollo.io Direct Import',
                    importedAt: new Date().toISOString(),
                },
            },
            create: {
                organizationId: params.organizationId,
                campaignId: params.campaignId || null,
                firstName: apolloPerson.firstName || params.firstName || 'Lead',
                lastName: apolloPerson.lastName || params.lastName || '',
                email: apolloPerson.email,
                title: apolloPerson.title || 'Executive',
                companyName: apolloPerson.organization?.name || params.companyName || 'Company',
                companyDomain: domain,
                phone: apolloPerson.phone,
                linkedinUrl: apolloPerson.linkedinUrl,
                industry: apolloPerson.organization?.industry || 'B2B Software',
                status: 'NEW',
                enriched: true,
                score: 95,
                customFields: {
                    ...dnsData,
                    domain,
                    mailProvider: dnsData.mailProvider,
                    logoUrl: apolloPerson.organization?.logoUrl || `https://logo.clearbit.com/${domain}`,
                    employeeRange: `${apolloPerson.organization?.estimatedNumEmployees || 250} Employees`,
                    headquarters: `${apolloPerson.city || ''}, ${apolloPerson.country || ''}`.trim(),
                    seniorityLevel: apolloPerson.seniority || 'Director',
                    apolloVerified: true,
                    dataSource: 'Apollo.io Direct Import',
                    importedAt: new Date().toISOString(),
                },
            },
        });
        return lead;
    }
}
exports.ApolloService = ApolloService;
