import { prisma } from '../../config/database';
import { ERROR_CODES } from '../../constants';

export class CampaignsService {
  async listCampaigns(organizationId: string) {
    const campaigns = await prisma.campaign.findMany({
      where: { organizationId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        _count: {
          select: {
            leads: true,
            messages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((c) => ({
      ...c,
      totalLeads: c._count.leads,
      totalMessages: c._count.messages,
    }));
  }

  async getCampaignById(id: string, organizationId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id, organizationId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        leads: { take: 100 },
        messages: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!campaign) {
      throw { status: 404, code: ERROR_CODES.NOT_FOUND, message: 'Campaign not found' };
    }

    return campaign;
  }

  async createCampaign(
    organizationId: string,
    createdById: string,
    data: {
      name: string;
      dailySendLimit?: number;
      steps?: Array<{
        order: number;
        channel: 'EMAIL' | 'LINKEDIN_MESSAGE' | 'LINKEDIN_CONNECT' | 'CALL';
        delayDays: number;
        subject?: string;
        body: string;
      }>;
    }
  ) {
    return prisma.campaign.create({
      data: {
        name: data.name,
        organizationId,
        createdById,
        dailySendLimit: data.dailySendLimit || 50,
        steps: {
          create: data.steps || [
            {
              order: 1,
              channel: 'EMAIL',
              delayDays: 0,
              subject: 'Quick question about {{companyName}}',
              body: 'Hi {{firstName}},\n\nI noticed your recent work at {{companyName}} and wanted to connect.\n\nBest,\nYour Name',
            },
          ],
        },
      },
      include: {
        steps: true,
      },
    });
  }

  async updateCampaign(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
      dailySendLimit?: number;
      steps?: Array<{
        order: number;
        channel: 'EMAIL' | 'LINKEDIN_MESSAGE' | 'LINKEDIN_CONNECT' | 'CALL';
        delayDays: number;
        subject?: string;
        body: string;
      }>;
    }
  ) {
    await this.getCampaignById(id, organizationId);

    // If steps are provided, replace them
    if (data.steps) {
      await prisma.sequenceStep.deleteMany({ where: { campaignId: id } });
      await prisma.sequenceStep.createMany({
        data: data.steps.map((s) => ({
          campaignId: id,
          order: s.order,
          channel: s.channel,
          delayDays: s.delayDays,
          subject: s.subject,
          body: s.body,
        })),
      });
    }

    return prisma.campaign.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status,
        dailySendLimit: data.dailySendLimit,
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async deleteCampaign(id: string, organizationId: string) {
    await this.getCampaignById(id, organizationId);
    await prisma.campaign.delete({ where: { id } });
    return { success: true };
  }
}

