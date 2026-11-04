"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInChannel = void 0;
const logger_1 = require("../../utils/logger");
class LinkedInChannel {
    async sendConnectRequest(leadLinkedinUrl, note) {
        logger_1.logger.info(`🔗 LinkedIn Connection Request dispatched to ${leadLinkedinUrl}`);
        return {
            success: true,
            channel: 'LINKEDIN_CONNECT',
            leadLinkedinUrl,
            status: 'INVITATION_SENT',
            note,
        };
    }
    async sendDirectMessage(leadLinkedinUrl, message) {
        logger_1.logger.info(`💬 LinkedIn InMail/Message dispatched to ${leadLinkedinUrl}`);
        return {
            success: true,
            channel: 'LINKEDIN_MESSAGE',
            leadLinkedinUrl,
            status: 'MESSAGE_DELIVERED',
            preview: message.slice(0, 50),
        };
    }
}
exports.LinkedInChannel = LinkedInChannel;
