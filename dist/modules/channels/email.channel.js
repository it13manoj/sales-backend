"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailChannel = void 0;
const providers_1 = require("../../config/providers");
const logger_1 = require("../../utils/logger");
class EmailChannel {
    transporter = (0, providers_1.createMailTransporter)();
    async send(payload) {
        const trackingPixel = payload.trackingId
            ? `<img src="${process.env.API_URL || 'http://localhost:4000'}/api/webhooks/track/open/${payload.trackingId}" width="1" height="1" alt="" style="display:none;" />`
            : '';
        const finalHtml = `${payload.html}${trackingPixel}`;
        try {
            const info = await this.transporter.sendMail({
                from: payload.from || providers_1.PROVIDERS_CONFIG.smtp.from,
                to: payload.to,
                subject: payload.subject,
                html: finalHtml,
            });
            logger_1.logger.info(`📧 Outbound email dispatched to ${payload.to}. MessageId: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to dispatch email to ${payload.to}:`, error.message);
            return { success: false, error: error.message };
        }
    }
}
exports.EmailChannel = EmailChannel;
