/**
 * app.js — Express application factory
 *
 * Creates and configures the Express app WITHOUT starting the HTTP server.
 * Separating app from server.js makes testing easier (import app, not server).
 *
 * Middleware stack (in order):
 *   1. helmet        — security headers
 *   2. cors          — cross-origin config
 *   3. morgan        — HTTP request logging
 *   4. json parser   — body parsing
 *   5. rate limiter  — general 100 req/min
 *   6. routes        — /auth, /quests, /rewards, /community
 *   7. 404 handler   — unmatched routes
 *   8. error handler — global error formatter (MUST be last)
 */

'use strict';

require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');

const authRoutes      = require('./routes/auth.routes');
const questsRoutes    = require('./routes/quests.routes');
const rewardsRoutes   = require('./routes/rewards.routes');
const communityRoutes = require('./routes/community.routes');
const { general }     = require('./middleware/rateLimiter');
const errorHandler    = require('./middleware/errorHandler');
const AppError        = require('./utils/AppError');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use(general);

// ── Health check (no auth) ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'quest-backend',
    env: process.env.NODE_ENV,
    ts: new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`,      authRoutes);
app.use(`${API}/quests`,    questsRoutes);
app.use(`${API}/rewards`,   rewardsRoutes);
app.use(`${API}/community`, communityRoutes);

// ── 404 — unmatched routes ────────────────────────────────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
});

// ── Global error handler (MUST be last) ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
