"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsController = void 0;
const campaigns_service_1 = require("./campaigns.service");
const campaignsService = new campaigns_service_1.CampaignsService();
class CampaignsController {
    async list(req, res, next) {
        try {
            const campaigns = await campaignsService.listCampaigns(req.user.organizationId);
            res.json({ success: true, data: campaigns });
        }
        catch (error) {
            next(error);
        }
    }
    async getOne(req, res, next) {
        try {
            const campaign = await campaignsService.getCampaignById(req.params.id, req.user.organizationId);
            res.json({ success: true, data: campaign });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const campaign = await campaignsService.createCampaign(req.user.organizationId, req.user.userId, req.body);
            res.status(201).json({ success: true, data: campaign });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const updated = await campaignsService.updateCampaign(req.params.id, req.user.organizationId, req.body);
            res.json({ success: true, data: updated });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const result = await campaignsService.deleteCampaign(req.params.id, req.user.organizationId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CampaignsController = CampaignsController;
