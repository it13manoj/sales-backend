import { Router } from 'express';
import { z } from 'zod';
import { CampaignsController } from './campaigns.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';

const router = Router();
const controller = new CampaignsController();

const stepSchema = z.object({
  order: z.number().int().positive(),
  channel: z.enum(['EMAIL', 'LINKEDIN_MESSAGE', 'LINKEDIN_CONNECT', 'CALL']),
  delayDays: z.number().int().min(0),
  subject: z.string().optional(),
  body: z.string().min(1),
});

const createCampaignSchema = z.object({
  name: z.string().min(1),
  dailySendLimit: z.number().int().min(1).max(1000).optional(),
  steps: z.array(stepSchema).optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
  dailySendLimit: z.number().int().min(1).max(1000).optional(),
  steps: z.array(stepSchema).optional(),
});

router.use(authenticate);

router.get('/', controller.list as any);
router.get('/:id', controller.getOne as any);
router.post('/', validateBody(createCampaignSchema), controller.create as any);
router.put('/:id', validateBody(updateCampaignSchema), controller.update as any);
router.delete('/:id', controller.delete as any);

export default router;

