import { createMailTransporter, PROVIDERS_CONFIG } from '../../config/providers';
import { logger } from '../../utils/logger';

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  trackingId?: string;
  from?: string;
}

export class EmailChannel {
  private transporter = createMailTransporter();

  async send(payload: SendEmailPayload) {
    const trackingPixel = payload.trackingId
      ? `<img src="${process.env.API_URL || 'http://localhost:4000'}/api/webhooks/track/open/${payload.trackingId}" width="1" height="1" alt="" style="display:none;" />`
      : '';

    const finalHtml = `${payload.html}${trackingPixel}`;

    try {
      const info = await this.transporter.sendMail({
        from: payload.from || PROVIDERS_CONFIG.smtp.from,
        to: payload.to,
        subject: payload.subject,
        html: finalHtml,
      });

      logger.info(`📧 Outbound email dispatched to ${payload.to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      logger.error(`❌ Failed to dispatch email to ${payload.to}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

