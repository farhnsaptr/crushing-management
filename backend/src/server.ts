import app from './app';
import { env } from './config/env.config';
import { testDbConnection } from './config/database';

async function startServer() {
  console.log('[Server] Starting Material Management API Server...');

  // Test Database Connection
  const dbConnected = await testDbConnection();
  if (!dbConnected) {
    console.warn('[Database] DB connection failed during startup. Server will start, but endpoints relying on DB will fail.');
  }

  const PORT = parseInt(env.PORT, 10);
  app.listen(PORT, () => {
    console.log(`[Server] API running on http://localhost:${PORT}`);
    console.log(`[Server] CORS Allowed Origin: ${env.CORS_ORIGIN}`);
  });
}

startServer();
