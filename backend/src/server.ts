import os from 'os';
import app from './app';
import { env } from './config/env.config';
import { testDbConnection } from './config/database';

function getLocalIpAddresses(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

async function startServer() {
  console.log('[Server] Starting Material Management API Server...');

  // Test Database Connection
  const dbConnected = await testDbConnection();
  if (!dbConnected) {
    console.warn('[Database] DB connection failed during startup. Server will start, but endpoints relying on DB will fail.');
  }

  const PORT = parseInt(env.PORT, 10);
  const HOST = '0.0.0.0';

  app.listen(PORT, HOST, () => {
    console.log(`\n[Server] API running:`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    const ips = getLocalIpAddresses();
    ips.forEach((ip) => {
      console.log(`  ➜  Network: http://${ip}:${PORT}/`);
    });
    console.log(`  ➜  Docs:    http://localhost:${PORT}/api-docs\n`);
  });
}

startServer();
