/**
 * middleware/errorHandler.js — Global Express error handler
 *
 * Must be the LAST app.use() call in server.js.
 * Catches everything forwarded via next(err).
 *
 * Rules:
 *  - AppError (isOperational=true)  → safe to expose message to client
 *  - pg errors                      → map to meaningful HTTP codes
 *  - express-validator errors       → 422 Unprocessable Entity
 *  - All other errors               → 500, generic message in production
 */

'use strict';

const AppError = require('../utils/AppError');

// PostgreSQL error codes we handle explicitly
const PG_UNIQUE_VIOLATION    = '23505';
const PG_FK_VIOLATION        = '23503';
const PG_CHECK_VIOLATION     = '23514';
const PG_NOT_NULL_VIOLATION  = '23502';
const PG_RESTRICT_VIOLATION  = '23001';

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // ── express-validator errors (passed as array via validationResult) ────────
  if (Array.isArray(err)) {
    return res.status(422).json({
      success: false,
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Request validation failed',
        fields:  err,
      },
    });
  }

  // ── PostgreSQL driver errors ───────────────────────────────────────────────
  if (err.code && err.code.length === 5 && /^\d{2}/.test(err.code)) {
    return handlePgError(err, res);
  }

  // ── Operational (AppError) ─────────────────────────────────────────────────
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  // ── JWT errors (from jsonwebtoken library) ─────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' },
    });
  }

  // ── Unknown / programming error ────────────────────────────────────────────
  // Log the full error in all envs; only expose detail in development.
  console.error('[ERROR]', {
    message: err.message,
    stack:   err.stack,
    url:     req.originalUrl,
    method:  req.method,
  });

  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'An unexpected error occurred';

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message },
  });
}

function handlePgError(err, res) {
  switch (err.code) {
    case PG_UNIQUE_VIOLATION:
      return res.status(409).json({
        success: false,
        error: {
          code:    'DUPLICATE_ENTRY',
          message: `A record with that value already exists (${err.detail || ''})`,
        },
      });

    case PG_FK_VIOLATION:
      return res.status(400).json({
        success: false,
        error: {
          code:    'REFERENCE_ERROR',
          message: 'Referenced record does not exist',
        },
      });

    case PG_CHECK_VIOLATION:
      // Catches our custom status-transition RAISE EXCEPTION too
      return res.status(400).json({
        success: false,
        error: {
          code:    'CONSTRAINT_VIOLATION',
          message: err.message || 'Data constraint violated',
        },
      });

    case PG_NOT_NULL_VIOLATION:
      return res.status(400).json({
        success: false,
        error: {
          code:    'MISSING_FIELD',
          message: `Required field missing: ${err.column || ''}`,
        },
      });

    case PG_RESTRICT_VIOLATION:
      return res.status(400).json({
        success: false,
        error: {
          code:    'OPERATION_RESTRICTED',
          message: err.message,
        },
      });

    default:
      console.error('[PG Error]', err);
      return res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: 'Database operation failed' },
      });
  }
}

module.exports = errorHandler;
