"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsController = void 0;
const leads_service_1 = require("./leads.service");
const leadsService = new leads_service_1.LeadsService();
class LeadsController {
    async list(req, res, next) {
        try {
            const { campaignId, status, search, page = '1', limit = '20' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const result = await leadsService.listLeads(req.user.organizationId, {
                campaignId: campaignId,
                status: status,
                search: search,
                skip,
                take,
            });
            res.json({
                success: true,
                data: result.leads,
                pagination: {
                    total: result.total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(result.total / Number(limit)),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getOne(req, res, next) {
        try {
            const lead = await leadsService.getLeadById(req.params.id, req.user.organizationId);
            res.json({ success: true, data: lead });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const lead = await leadsService.createLead(req.user.organizationId, req.body);
            res.status(201).json({ success: true, data: lead });
        }
        catch (error) {
            next(error);
        }
    }
    async importBatch(req, res, next) {
        try {
            const { leads, campaignId } = req.body;
            const result = await leadsService.importLeadsBatch(req.user.organizationId, leads, campaignId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const updated = await leadsService.updateLead(req.params.id, req.user.organizationId, req.body);
            res.json({ success: true, data: updated });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const result = await leadsService.deleteLead(req.params.id, req.user.organizationId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async seedSampleLeads(req, res, next) {
        try {
            const result = await leadsService.seedSampleEnterpriseLeads(req.user.organizationId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LeadsController = LeadsController;
