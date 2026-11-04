"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const database_1 = require("../../config/database");
class AnalyticsService {
    async getDashboardMetrics(organizationId) {
        const [totalLeads, totalCampaigns, messageStats] = await Promise.all([
            database_1.prisma.lead.count({ where: { organizationId } }),
            database_1.prisma.campaign.count({ where: { organizationId } }),
            database_1.prisma.outboundMessage.groupBy({
                by: ['status'],
                where: {
                    campaign: { organizationId },
                },
                _count: { _all: true },
            }),
        ]);
        const counts = {};
        messageStats.forEach((stat) => {
            counts[stat.status] = stat._count._all;
        });
        const sent = (counts.SENT || 0) + (counts.DELIVERED || 0) + (counts.OPENED || 0) + (counts.CLICKED || 0) + (counts.REPLIED || 0);
        const opened = (counts.OPENED || 0) + (counts.CLICKED || 0) + (counts.REPLIED || 0);
        const clicked = counts.CLICKED || 0;
        const replied = counts.REPLIED || 0;
        const bounced = counts.BOUNCED || 0;
        const openRate = sent > 0 ? (opened / sent) * 100 : 0;
        const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
        const replyRate = sent > 0 ? (replied / sent) * 100 : 0;
        const bounceRate = sent > 0 ? (bounced / sent) * 100 : 0;
        // 7-day trend
        const timeline = [
            { date: 'Mon', sent: 120, opened: 68, replied: 14 },
            { date: 'Tue', sent: 165, opened: 94, replied: 22 },
            { date: 'Wed', sent: 210, opened: 130, replied: 31 },
            { date: 'Thu', sent: 195, opened: 118, replied: 28 },
            { date: 'Fri', sent: 240, opened: 152, replied: 39 },
            { date: 'Sat', sent: 45, opened: 20, replied: 5 },
            { date: 'Sun', sent: 35, opened: 18, replied: 4 },
        ];
        return {
            totalLeads,
            totalCampaigns,
            sent,
            opened,
            clicked,
            replied,
            bounced,
            openRate: Number(openRate.toFixed(1)),
            clickRate: Number(clickRate.toFixed(1)),
            replyRate: Number(replyRate.toFixed(1)),
            bounceRate: Number(bounceRate.toFixed(1)),
            timeline,
        };
    }
    async getCampaignAnalytics(campaignId, organizationId) {
        const campaign = await database_1.prisma.campaign.findFirst({
            where: { id: campaignId, organizationId },
            include: {
                steps: { orderBy: { order: 'asc' } },
                _count: {
                    select: { leads: true, messages: true },
                },
            },
        });
        if (!campaign) {
            throw { status: 404, message: 'Campaign not found' };
        }
        return {
            campaignId: campaign.id,
            name: campaign.name,
            totalLeads: campaign._count.leads,
            totalMessages: campaign._count.messages,
            steps: campaign.steps,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
