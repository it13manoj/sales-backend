import { Router, Response } from 'express';
import { EmailChannel } from './email.channel';
import { LinkedInChannel } from './linkedin.channel';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.middleware';

const router = Router();
const emailChannel = new EmailChannel();
const linkedinChannel = new LinkedInChannel();

router.use(authenticate);

router.post('/test-email', async (req: AuthenticatedRequest, res: Response) => {
  const { to, subject, message } = req.body;
  const result = await emailChannel.send({
    to: to || req.user!.email,
    subject: subject || 'Test Outbound Email',
    html: `<p>${message || 'This is a test outbound email sent from Outbound Sales Platform.'}</p>`,
  });
  res.json({ success: true, result });
});

router.post('/test-linkedin', async (req: AuthenticatedRequest, res: Response) => {
  const { linkedinUrl, note } = req.body;
  const result = await linkedinChannel.sendConnectRequest(linkedinUrl || 'https://linkedin.com/in/test-lead', note);
  res.json({ success: true, result });
});

export default router;

