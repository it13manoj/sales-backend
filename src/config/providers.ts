import nodemailer from 'nodemailer';

export const PROVIDERS_CONFIG = {
  apollo: {
    apiKey: process.env.APOLLO_API_KEY || 'mock-apollo-key',
    baseUrl: 'https://api.apollo.io/v1',
  },
  hunter: {
    apiKey: process.env.HUNTER_API_KEY || 'mock-hunter-key',
    baseUrl: 'https://api.hunter.io/v2',
  },
  clearbit: {
    apiKey: process.env.CLEARBIT_API_KEY || 'mock-clearbit-key',
    baseUrl: 'https://person-stream.clearbit.com/v2',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT) || 1025,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Outbound AI <no-reply@outbound-platform.io>',
  },
};

export function createMailTransporter() {
  const { host, port, user, pass } = PROVIDERS_CONFIG.smtp;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });
}

