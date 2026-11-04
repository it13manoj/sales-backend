"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUES = exports.LIMITS = exports.ERROR_CODES = void 0;
exports.ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    CONFLICT: 'CONFLICT',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};
exports.LIMITS = {
    MAX_STEPS_PER_CAMPAIGN: 15,
    DEFAULT_DAILY_SEND_LIMIT: 50,
    MAX_DAILY_SEND_LIMIT: 1000,
    MAX_LEADS_PER_IMPORT: 5000,
};
exports.QUEUES = {
    OUTBOUND_EMAIL: 'outbound-email-queue',
    LEAD_ENRICHMENT: 'lead-enrichment-queue',
};
