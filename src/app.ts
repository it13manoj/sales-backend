import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

import authRoutes from './modules/auth/auth.routes';
import campaignsRoutes from './modules/campaigns/campaigns.routes';
import leadsRoutes from './modules/leads/leads.routes';
import enrichmentRoutes from './modules/enrichment/enrichment.routes';
import channelsRoutes from './modules/channels/channels.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import webhooksRoutes from './modules/webhooks/webhooks.routes';
import { apiRateLimiter } from './middleware/ratelimit.middleware';
import { ERROR_CODES } from './constants';

const app = express();

// Security & utilities
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limit API routes
app.use('/api', apiRateLimiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Outbound Sales Platform API',
  });
});

// Mount modules
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/enrichment', enrichmentRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Frontend static build serving (SPA Router Support)
const frontendDistCandidates = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, './public'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'dist/public'),
  path.resolve(process.cwd(), 'public'),
];

const frontendDist = frontendDistCandidates.find(
  (dir) => fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))
);

if (frontendDist) {
  console.log(`[Static] Serving frontend SPA from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 handler for API routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: ERROR_CODES.NOT_FOUND,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const code = err.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  console.error(`[Global Error] ${req.method} ${req.url}:`, err);

  res.status(status).json({
    code,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

export default app;

