import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { env } from './env.config';

const servers: { url: string; description: string }[] = [];

// 1. Jika API_BASE_URL diset di .env (misal http://172.19.82.34:4001 atau domain), prioritaskan sebagai server utama
if (env.API_BASE_URL && env.API_BASE_URL.trim() !== '') {
  servers.push({
    url: env.API_BASE_URL.replace(/\/+$/, ''),
    description: 'Configured Server (from .env API_BASE_URL)',
  });
}

// 2. Fallback relatif '/' agar otomatis mengikuti IP/Domain & Port browser saat ini
servers.push({
  url: '/',
  description: 'Current Host (Relative URL)',
});

// 3. Fallback localhost untuk development lokal
servers.push({
  url: `http://localhost:${env.PORT}`,
  description: 'Localhost Server',
});

// Normalisasi path ke format POSIX forward slash ('/') agar kompatibel dengan glob di Windows & Linux/Docker
const modulesPath = path.resolve(__dirname, '../modules').split(path.sep).join('/');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crushing Management API',
      version: '1.0.0',
      description: 'REST API documentation for PT Sugity Creatives Crushing Management system',
    },
    servers,
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  // Scan semua file routes dan controller di environment dev (*.ts) maupun prod dist (*.js)
  apis: [
    `${modulesPath}/**/*.routes.ts`,
    `${modulesPath}/**/*.routes.js`,
    `${modulesPath}/**/*.controller.ts`,
    `${modulesPath}/**/*.controller.js`,
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
