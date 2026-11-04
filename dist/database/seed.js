"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config();
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'mysql://root:12345678@localhost:3306/outbounds';
}
const database_1 = require("../config/database");
const crypto_1 = require("../utils/crypto");
async function seed() {
    console.log('🌱 Starting Outbound Sales Platform Database Seed...');
    // 1. Create Organization
    const org = await database_1.prisma.organization.upsert({
        where: { id: 'org-demo-123' },
        update: {},
        create: {
            id: 'org-demo-123',
            name: 'Acme Outbound Enterprise',
            domain: 'outboundsales.io',
        },
    });
    // 2. Create Users
    const passwordHash = await (0, crypto_1.hashPassword)('Password123!');
    const admin = await database_1.prisma.user.upsert({
        where: { email: 'admin@outboundsales.io' },
        update: { passwordHash },
        create: {
            email: 'admin@outboundsales.io',
            passwordHash,
            firstName: 'Sarah',
            lastName: 'Connor',
            role: 'ORG_ADMIN',
            organizationId: org.id,
        },
    });
    const rep = await database_1.prisma.user.upsert({
        where: { email: 'rep@outboundsales.io' },
        update: { passwordHash },
        create: {
            email: 'rep@outboundsales.io',
            passwordHash,
            firstName: 'Alex',
            lastName: 'Mercer',
            role: 'SALES_REP',
            organizationId: org.id,
        },
    });
    // 3. Create Email Account
    const emailAccount = await database_1.prisma.emailAccount.upsert({
        where: { id: 'email-acc-123' },
        update: {},
        create: {
            id: 'email-acc-123',
            organizationId: org.id,
            email: 'alex@outboundsales.io',
            senderName: 'Alex Mercer',
            smtpHost: 'localhost',
            smtpPort: 1025,
            smtpUser: 'test',
            smtpPass: 'test',
            dailyLimit: 250,
            sentToday: 42,
        },
    });
    // 4. Create Campaign with Sequence Steps
    const campaign = await database_1.prisma.campaign.upsert({
        where: { id: 'campaign-demo-1' },
        update: {},
        create: {
            id: 'campaign-demo-1',
            organizationId: org.id,
            createdById: admin.id,
            emailAccountId: emailAccount.id,
            name: 'Q1 Enterprise AI Copilot Outbound',
            status: 'ACTIVE',
            dailySendLimit: 100,
            steps: {
                create: [
                    {
                        order: 1,
                        channel: 'EMAIL',
                        delayDays: 0,
                        subject: 'Quick question regarding AI at {{companyName}}',
                        body: 'Hi {{firstName}},\n\nSaw that {{companyName}} is scaling engineering. We built an autonomous risk copilot for enterprise fintechs that cuts manual verification by 80%.\n\nOpen to reviewing our 2-min teardown this Thursday?\n\nBest,\nAlex',
                    },
                    {
                        order: 2,
                        channel: 'LINKEDIN_MESSAGE',
                        delayDays: 3,
                        subject: 'Connecting on LinkedIn',
                        body: 'Hi {{firstName}}, sent a brief email earlier. Would love to stay connected here as well!',
                    },
                    {
                        order: 3,
                        channel: 'EMAIL',
                        delayDays: 4,
                        subject: 'Re: Quick question regarding AI at {{companyName}}',
                        body: 'Hi {{firstName}},\n\nWanted to follow up briefly with our case study on how Cantos reduced support tickets by 31% in 7 weeks.\n\nLet me know if you would like me to send the slides.\n\nCheers,\nAlex',
                    },
                ],
            },
        },
    });
    // 5. Seed Leads
    const sampleLeads = [
        {
            firstName: 'Elena',
            lastName: 'Ruiz',
            email: 'elena.ruiz@cantos.io',
            companyName: 'Cantos SaaS',
            title: 'VP of Product',
            phone: '+1 415-555-0199',
            industry: 'B2B SaaS',
            status: 'REPLIED',
            enriched: true,
            score: 94,
        },
        {
            firstName: 'Marcus',
            lastName: 'Tan',
            email: 'm.tan@vectorpay.com',
            companyName: 'VectorPay',
            title: 'Chief Technology Officer',
            phone: '+1 212-555-0182',
            industry: 'Fintech',
            status: 'OPENED',
            enriched: true,
            score: 91,
        },
        {
            firstName: 'David',
            lastName: 'Kim',
            email: 'dkim@northwayretail.com',
            companyName: 'Northway Retail',
            title: 'Head of Ecommerce Systems',
            phone: '+1 312-555-0144',
            industry: 'Retail Tech',
            status: 'CONTACTED',
            enriched: true,
            score: 85,
        },
        {
            firstName: 'Samantha',
            lastName: 'Reed',
            email: 'sreed@apexmedical.org',
            companyName: 'Apex Medical Systems',
            title: 'Director of Healthcare Operations',
            phone: '+1 617-555-0133',
            industry: 'Healthcare Tech',
            status: 'NEW',
            enriched: false,
            score: 72,
        },
        {
            firstName: 'Jason',
            lastName: 'Vance',
            email: 'jvance@cloudstream.co',
            companyName: 'CloudStream Security',
            title: 'Chief Information Security Officer',
            phone: '+1 206-555-0155',
            industry: 'Cybersecurity',
            status: 'CONVERTED',
            enriched: true,
            score: 98,
        },
    ];
    for (const lead of sampleLeads) {
        await database_1.prisma.lead.upsert({
            where: {
                organizationId_email: {
                    organizationId: org.id,
                    email: lead.email,
                },
            },
            update: {
                status: lead.status,
                score: lead.score,
            },
            create: {
                ...lead,
                organizationId: org.id,
                campaignId: campaign.id,
            },
        });
    }
    console.log('✅ Database seed completed successfully!');
    console.log('👉 Admin credentials: admin@outboundsales.io / Password123!');
    console.log('👉 Rep credentials:   rep@outboundsales.io / Password123!');
}
seed()
    .catch((e) => {
    console.error('Seed error:', e);
})
    .finally(async () => {
    await database_1.prisma.$disconnect();
});
