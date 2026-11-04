import { Response, NextFunction } from 'express';
import { LeadsService } from './leads.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

const leadsService = new LeadsService();

export class LeadsController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { campaignId, status, search, page = '1', limit = '20' } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const result = await leadsService.listLeads(req.user!.organizationId, {
        campaignId: campaignId as string,
        status: status as any,
        search: search as string,
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
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const lead = await leadsService.getLeadById(req.params.id as string, req.user!.organizationId);
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const lead = await leadsService.createLead(req.user!.organizationId, req.body);
      res.status(201).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async importBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { leads, campaignId } = req.body;
      const result = await leadsService.importLeadsBatch(req.user!.organizationId, leads, campaignId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await leadsService.updateLead(req.params.id as string, req.user!.organizationId, req.body);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await leadsService.deleteLead(req.params.id as string, req.user!.organizationId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async seedSampleLeads(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await leadsService.seedSampleEnterpriseLeads(req.user!.organizationId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
