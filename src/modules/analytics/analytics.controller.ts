import { Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDashboardMetrics(req.user!.organizationId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const campaignId = req.params.campaignId as string;
      const data = await analyticsService.getCampaignAnalytics(campaignId, req.user!.organizationId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
