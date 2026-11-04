import { prisma } from '../../config/database';
import { ERROR_CODES } from '../../constants';

export class LeadsService {
  async listLeads(
    organizationId: string,
    filters: {
      campaignId?: string;
      status?: any;
      search?: string;
      skip?: number;
      take?: number;
    }
  ) {
    const where: any = { organizationId };

    if (filters.campaignId) {
      where.campaignId = filters.campaignId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
        { email: { contains: filters.search } },
        { companyName: { contains: filters.search } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip: filters.skip || 0,
        take: filters.take || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return { leads, total };
  }

  async getLeadById(id: string, organizationId: string) {
    const lead = await prisma.lead.findFirst({
      where: { id, organizationId },
      include: {
        campaign: true,
        messages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw { status: 404, code: ERROR_CODES.NOT_FOUND, message: 'Lead not found' };
    }

    return lead;
  }

  async createLead(organizationId: string, data: any) {
    return prisma.lead.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async importLeadsBatch(organizationId: string, leads: any[], campaignId?: string) {
    const created: any[] = [];
    const errors: any[] = [];

    for (const lead of leads) {
      try {
        const item = await prisma.lead.upsert({
          where: {
            organizationId_email: {
              organizationId,
              email: lead.email,
            },
          },
          update: {
            firstName: lead.firstName,
            lastName: lead.lastName,
            companyName: lead.companyName,
            title: lead.title,
            phone: lead.phone,
            campaignId: campaignId || lead.campaignId,
          },
          create: {
            organizationId,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            companyName: lead.companyName,
            title: lead.title,
            phone: lead.phone,
            campaignId: campaignId || lead.campaignId,
          },
        });
        created.push(item);
      } catch (err: any) {
        errors.push({ email: lead.email, error: err.message });
      }
    }

    return { count: created.length, created, errors };
  }

  async updateLead(id: string, organizationId: string, data: any) {
    await this.getLeadById(id, organizationId);
    return prisma.lead.update({
      where: { id },
      data,
    });
  }

  async deleteLead(id: string, organizationId: string) {
    await this.getLeadById(id, organizationId);
    await prisma.lead.delete({ where: { id } });
    return { success: true };
  }

  async seedSampleEnterpriseLeads(organizationId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { organizationId },
    });

    const brands = [
      { f: 'Brian', l: 'Chesky', e: 'brian@airbnb.com', c: 'Airbnb', d: 'airbnb.com', t: 'Co-Founder & CEO', ind: 'Travel Tech & Marketplaces', hq: 'San Francisco, CA' },
      { f: 'Dara', l: 'Khosrowshahi', e: 'dara@uber.com', c: 'Uber', d: 'uber.com', t: 'Chief Executive Officer', ind: 'Mobility & Logistics Tech', hq: 'San Francisco, CA' },
      { f: 'Daniel', l: 'Ek', e: 'dek@spotify.com', c: 'Spotify', d: 'spotify.com', t: 'Chief Executive Officer & Founder', ind: 'Audio Streaming & Media', hq: 'Stockholm / New York' },
      { f: 'Greg', l: 'Brockman', e: 'greg@openai.com', c: 'OpenAI', d: 'openai.com', t: 'President & Co-Founder', ind: 'Artificial Intelligence', hq: 'San Francisco, CA' },
      { f: 'Bret', l: 'Taylor', e: 'bret@sierra.ai', c: 'Sierra AI', d: 'sierra.ai', t: 'Co-Founder & Chairman', ind: 'Enterprise Conversational AI', hq: 'San Francisco, CA' },
      { f: 'Parker', l: 'Conrad', e: 'parker@rippling.com', c: 'Rippling', d: 'rippling.com', t: 'Founder & CEO', ind: 'Workforce Management Cloud', hq: 'San Francisco, CA' },
      { f: 'Mathilde', l: 'Collin', e: 'mathilde@frontapp.com', c: 'Front', d: 'front.com', t: 'Co-Founder & Executive Chair', ind: 'Customer Operations & Helpdesk', hq: 'San Francisco, CA' },
      { f: 'Rahul', l: 'Vohra', e: 'rahul@superhuman.com', c: 'Superhuman', d: 'superhuman.com', t: 'Founder & CEO', ind: 'Productivity & Email Software', hq: 'San Francisco, CA' },
      { f: 'Gillian', l: 'Tans', e: 'gillian@booking.com', c: 'Booking.com', d: 'booking.com', t: 'Senior Vice President', ind: 'Travel Technology', hq: 'Amsterdam, Netherlands' },
      { f: 'Austin', l: 'Russel', e: 'austin@luminartech.com', c: 'Luminar Technologies', d: 'luminartech.com', t: 'Chief Executive Officer', ind: 'Automotive Lidar & Vision AI', hq: 'Orlando, FL' },
    ];

    let count = 0;
    for (const b of brands) {
      const customFields = {
        domain: b.d,
        mailProvider: 'Google Workspace (Enterprise)',
        employeeRange: '1,000+ Employees (Enterprise)',
        estimatedRevenue: '$200M+ ARR',
        foundedYear: 2015,
        headquarters: b.hq,
        techStack: ['TypeScript', 'React', 'Python', 'AWS', 'PostgreSQL', 'Docker'],
        logoUrl: `https://logo.clearbit.com/${b.d}`,
        fallbackLogoUrl: `https://www.google.com/s2/favicons?domain=${b.d}&sz=128`,
        companyLinkedinUrl: `https://www.linkedin.com/company/${b.c.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        apolloVerified: true,
        dataSource: 'Apollo.io Enterprise Verified',
        isDeliverable: true,
        spfValid: true,
        dmarcValid: true,
        seniorityLevel: 'C-Suite / Executive',
        icpScore: 97,
        enrichedAt: new Date().toISOString(),
      };

      await prisma.lead.upsert({
        where: {
          organizationId_email: {
            organizationId,
            email: b.e,
          },
        },
        update: {
          firstName: b.f,
          lastName: b.l,
          title: b.t,
          companyName: b.c,
          companyDomain: b.d,
          industry: b.ind,
          status: 'NEW',
          score: 97,
          enriched: true,
          customFields: customFields as any,
        },
        create: {
          organizationId,
          campaignId: campaign ? campaign.id : null,
          firstName: b.f,
          lastName: b.l,
          email: b.e,
          title: b.t,
          companyName: b.c,
          companyDomain: b.d,
          industry: b.ind,
          status: 'NEW',
          score: 97,
          enriched: true,
          customFields: customFields as any,
        },
      });
      count++;
    }

    return { count };
  }
}

