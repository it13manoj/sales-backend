"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
const analyticsService = new analytics_service_1.AnalyticsService();
class AnalyticsController {
    async getDashboard(req, res, next) {
        try {
            const data = await analyticsService.getDashboardMetrics(req.user.organizationId);
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async getCampaign(req, res, next) {
        try {
            const campaignId = req.params.campaignId;
            const data = await analyticsService.getCampaignAnalytics(campaignId, req.user.organizationId);
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
