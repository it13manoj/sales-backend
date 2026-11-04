import { Response, NextFunction } from 'express';
import { CampaignsService } from './campaigns.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

const campaignsService = new CampaignsService();

export class CampaignsController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const campaigns = await campaignsService.listCampaigns(req.user!.organizationId);
      res.json({ success: true, data: campaigns });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.getCampaignById(req.params.id as string, req.user!.organizationId);
      res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.createCampaign(
        req.user!.organizationId,
        req.user!.userId,
        req.body
      );
      res.status(201).json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await campaignsService.updateCampaign(
        req.params.id as string,
        req.user!.organizationId,
        req.body
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await campaignsService.deleteCampaign(req.params.id as string, req.user!.organizationId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
