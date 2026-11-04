import { Router } from 'express';
import { z } from 'zod';
import { LeadsController } from './leads.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';

const router = Router();
const controller = new LeadsController();

const createLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  title: z.string().optional(),
  companyName: z.string().min(1),
  companyDomain: z.string().optional(),
  industry: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  campaignId: z.string().uuid().optional(),
  score: z.number().int().min(0).max(100).optional(),
});

const importBatchSchema = z.object({
  campaignId: z.string().uuid().optional(),
  leads: z.array(
    z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      companyName: z.string().min(1),
      phone: z.string().optional(),
      title: z.string().optional(),
    })
  ),
});

router.use(authenticate);

router.get('/', controller.list as any);
router.get('/:id', controller.getOne as any);
router.post('/seed-sample-leads', controller.seedSampleLeads as any);
router.post('/', validateBody(createLeadSchema), controller.create as any);
router.post('/import-batch', validateBody(importBatchSchema), controller.importBatch as any);
router.put('/:id', controller.update as any);
router.delete('/:id', controller.delete as any);

export default router;

