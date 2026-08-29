import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env.config';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { apiLimiter } from './middlewares/rateLimiter.middleware';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import departmentsRoutes from './modules/departments/departments.routes';
import factoriesRoutes from './modules/factories/factories.routes';
import machinesRoutes from './modules/machines/machines.routes';
import masterPartsRoutes from './modules/master-parts/masterParts.routes';
import crushingRequestsRoutes from './modules/crushing-requests/crushingRequests.routes';
import ngTransactionsRoutes from './modules/ng-transactions/ngTransactions.routes';
import productionActualRoutes from './modules/production-actual/productionActual.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import siteConfigRoutes from './modules/site-config/siteConfig.routes';
import globalLogsRoutes from './modules/global-logs/globalLogs.routes';
import materialsRoutes from './modules/materials/materials.routes';
import runnerMaterialRoutes from './modules/runner-material/runnerMaterial.routes';
import verificationRoutes from './modules/verification/verification.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

const app: Application = express();

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Global CORS Configuration
const allowedOrigins = [
  env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
].filter(Boolean);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!requestOrigin) return callback(null, true);

      // Check against explicit allowed list or local/LAN IP patterns
      if (
        allowedOrigins.includes(requestOrigin) ||
        /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(requestOrigin)
      ) {
        return callback(null, true);
      }

      // Allow request
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Audit Logger (Redis Stream)
app.use(requestLogger);

// General Rate Limiter for all /api endpoints
app.use('/api', apiLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Material Management API', timestamp: new Date() });
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/factories', factoriesRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/master-parts', masterPartsRoutes);
app.use('/api/crushing-requests', crushingRequestsRoutes);
app.use('/api/ng-transactions', ngTransactionsRoutes);
app.use('/api/production-actual', productionActualRoutes);
app.use('/api/runner-material', runnerMaterialRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/admin/logs', globalLogsRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
