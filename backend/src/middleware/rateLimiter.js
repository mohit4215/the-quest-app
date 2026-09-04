/**
 * middleware/rateLimiter.js — Express rate limiters
 *
 * Three tiers:
 *   general   — 100 req / 60 s  (applied globally)
 *   auth      — 10  req / 60 s  (login + register)
 *   claim     — 5   req / 60 s  (quest claim — extra tight to deter spam-clicking)
 */

'use strict';

const rateLimit = require('express-rate-limit');

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;

const general = rateLimit({
  windowMs,
  max:     Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, please slow down.' },
  },
});

const auth = rateLimit({
  windowMs,
  max: 10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many auth attempts, try again in a minute.' },
  },
});

const claim = rateLimit({
  windowMs,
  max: 5,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => req.user?.id ?? req.ip, // rate-limit per user, not IP
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many claim attempts, slow down.' },
  },
});

module.exports = { general, auth, claim };
