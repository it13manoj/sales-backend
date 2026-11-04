"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const database_1 = require("../../config/database");
const constants_1 = require("../../constants");
class CampaignsService {
    async listCampaigns(organizationId) {
        const campaigns = await database_1.prisma.campaign.findMany({
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
    async getCampaignById(id, organizationId) {
        const campaign = await database_1.prisma.campaign.findFirst({
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
            throw { status: 404, code: constants_1.ERROR_CODES.NOT_FOUND, message: 'Campaign not found' };
        }
        return campaign;
    }
    async createCampaign(organizationId, createdById, data) {
        return database_1.prisma.campaign.create({
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
    async updateCampaign(id, organizationId, data) {
        await this.getCampaignById(id, organizationId);
        // If steps are provided, replace them
        if (data.steps) {
            await database_1.prisma.sequenceStep.deleteMany({ where: { campaignId: id } });
            await database_1.prisma.sequenceStep.createMany({
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
        return database_1.prisma.campaign.update({
            where: { id },
            data: {
                name: data.name,
                status: data.status,
                dailySendLimit: data.dailySendLimit,
            },
            include: { steps: { orderBy: { order: 'asc' } } },
        });
    }
    async deleteCampaign(id, organizationId) {
        await this.getCampaignById(id, organizationId);
        await database_1.prisma.campaign.delete({ where: { id } });
        return { success: true };
    }
}
exports.CampaignsService = CampaignsService;
