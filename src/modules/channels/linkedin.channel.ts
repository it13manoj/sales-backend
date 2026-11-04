import { logger } from '../../utils/logger';

export class LinkedInChannel {
  async sendConnectRequest(leadLinkedinUrl: string, note?: string) {
    logger.info(`🔗 LinkedIn Connection Request dispatched to ${leadLinkedinUrl}`);
    return {
      success: true,
      channel: 'LINKEDIN_CONNECT',
      leadLinkedinUrl,
      status: 'INVITATION_SENT',
      note,
    };
  }

  async sendDirectMessage(leadLinkedinUrl: string, message: string) {
    logger.info(`💬 LinkedIn InMail/Message dispatched to ${leadLinkedinUrl}`);
    return {
      success: true,
      channel: 'LINKEDIN_MESSAGE',
      leadLinkedinUrl,
      status: 'MESSAGE_DELIVERED',
      preview: message.slice(0, 50),
    };
  }
}

