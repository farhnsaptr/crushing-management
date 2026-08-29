import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crushing Management API',
      version: '1.0.0',
      description: 'REST API documentation for the Crushing Management system',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local server',
      },
    ],
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
  // Scan all route files for @swagger JSDoc annotations
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
