"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const campaigns_routes_1 = __importDefault(require("./modules/campaigns/campaigns.routes"));
const leads_routes_1 = __importDefault(require("./modules/leads/leads.routes"));
const enrichment_routes_1 = __importDefault(require("./modules/enrichment/enrichment.routes"));
const channels_routes_1 = __importDefault(require("./modules/channels/channels.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const webhooks_routes_1 = __importDefault(require("./modules/webhooks/webhooks.routes"));
const ratelimit_middleware_1 = require("./middleware/ratelimit.middleware");
const constants_1 = require("./constants");
const app = (0, express_1.default)();
// Security & utilities
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limit API routes
app.use('/api', ratelimit_middleware_1.apiRateLimiter);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Outbound Sales Platform API',
    });
});
// Mount modules
app.use('/api/auth', auth_routes_1.default);
app.use('/api/campaigns', campaigns_routes_1.default);
app.use('/api/leads', leads_routes_1.default);
app.use('/api/enrichment', enrichment_routes_1.default);
app.use('/api/channels', channels_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/webhooks', webhooks_routes_1.default);
// Frontend static build serving (SPA Router Support)
const frontendDistCandidates = [
    path_1.default.resolve(__dirname, '../../frontend/dist'),
    path_1.default.resolve(__dirname, '../public'),
    path_1.default.resolve(__dirname, './public'),
    path_1.default.resolve(process.cwd(), 'frontend/dist'),
    path_1.default.resolve(process.cwd(), 'dist/public'),
    path_1.default.resolve(process.cwd(), 'public'),
];
const frontendDist = frontendDistCandidates.find((dir) => fs_1.default.existsSync(dir) && fs_1.default.existsSync(path_1.default.join(dir, 'index.html')));
if (frontendDist) {
    console.log(`[Static] Serving frontend SPA from: ${frontendDist}`);
    app.use(express_1.default.static(frontendDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
            return next();
        }
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    });
}
// 404 handler for API routes
app.use((req, res) => {
    res.status(404).json({
        code: constants_1.ERROR_CODES.NOT_FOUND,
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    });
});
// Global Error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const code = err.code || constants_1.ERROR_CODES.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal Server Error';
    console.error(`[Global Error] ${req.method} ${req.url}:`, err);
    res.status(status).json({
        code,
        message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
});
exports.default = app;
