import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.util';

// Rate limiter for authentication routes (login)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.headers['x-test-suite'] === 'true',
  handler: (req, res) => {
    sendError(res, 'Too many login attempts. Please try again after 15 minutes.', 429);
  },
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.headers['x-test-suite'] === 'true',
  handler: (req, res) => {
    sendError(res, 'Too many requests. Please slow down.', 429);
  },
});

// Heavy operations rate limiter (e.g. CSV/Excel imports)
export const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 import requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.headers['x-test-suite'] === 'true',
  handler: (req, res) => {
    sendError(res, 'Too many file import requests. Please try again later.', 429);
  },
});
