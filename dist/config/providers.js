"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDERS_CONFIG = void 0;
exports.createMailTransporter = createMailTransporter;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.PROVIDERS_CONFIG = {
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
function createMailTransporter() {
    const { host, port, user, pass } = exports.PROVIDERS_CONFIG.smtp;
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass } : undefined,
    });
}
