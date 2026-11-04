"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const email_worker_1 = require("./jobs/email.worker");
const enrich_worker_1 = require("./jobs/enrich.worker");
const logger_1 = require("./utils/logger");
const PORT = Number(process.env.PORT) || 4000;
async function bootstrap() {
    try {
        // 1. Connect to MySQL Database
        await (0, database_1.connectDatabase)();
        // 2. Start Background Queue Workers
        (0, email_worker_1.startEmailWorker)();
        (0, enrich_worker_1.startEnrichWorker)();
        // 3. Start HTTP Server
        const server = app_1.default.listen(PORT, () => {
            logger_1.logger.info(`🚀 Outbound Sales Platform Backend running on port ${PORT}`);
            logger_1.logger.info(`👉 API Base URL: http://localhost:${PORT}/api`);
            logger_1.logger.info(`👉 Health Check: http://localhost:${PORT}/health`);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger_1.logger.error(`⚠️ Port ${PORT} is already in use. Please free port ${PORT} or restart.`);
            }
            else {
                logger_1.logger.error('Server error:', err);
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Fatal initialization error:', error.message);
        process.exit(1);
    }
}
bootstrap();
