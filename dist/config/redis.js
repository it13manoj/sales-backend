"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;
let hasLoggedOfflineWarning = false;
exports.redisConnection = new ioredis_1.default({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy(times) {
        if (times > 2) {
            if (!hasLoggedOfflineWarning) {
                console.log('ℹ️ Redis is offline or not installed locally. Queue workers will operate in direct/passive mode.');
                hasLoggedOfflineWarning = true;
            }
            return null; // Stop retrying to avoid console flooding
        }
        return 1000;
    },
});
exports.redisConnection.on('connect', () => {
    console.log('✅ Connected to Redis successfully.');
});
exports.redisConnection.on('error', (err) => {
    if (!hasLoggedOfflineWarning) {
        console.log('ℹ️ Redis is offline or not installed locally. Queue workers will operate in direct/passive mode.');
        hasLoggedOfflineWarning = true;
    }
});
