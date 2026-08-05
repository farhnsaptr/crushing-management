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
import factoriesRoutes from './modules/factories/factories.routes';
import machinesRoutes from './modules/machines/machines.routes';
import masterPartsRoutes from './modules/master-parts/masterParts.routes';
import ngTransactionsRoutes from './modules/ng-transactions/ngTransactions.routes';
import productionActualRoutes from './modules/production-actual/productionActual.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import siteConfigRoutes from './modules/site-config/siteConfig.routes';
import globalLogsRoutes from './modules/global-logs/globalLogs.routes';

const app: Application = express();

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Global Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
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
  res.json({ status: 'ok', service: 'Crushing Management API', timestamp: new Date() });
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/factories', factoriesRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/master-parts', masterPartsRoutes);
app.use('/api/ng-transactions', ngTransactionsRoutes);
app.use('/api/production-actual', productionActualRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/admin/logs', globalLogsRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
