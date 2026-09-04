/**
 * middleware/auth.js — JWT authentication & role-based authorization
 *
 * authenticate   — verifies Bearer token, attaches req.user
 * requireRole    — restricts route to one or more roles
 * optionalAuth   — like authenticate but doesn't reject anonymous requests
 */

'use strict';

const jwt      = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { query } = require('../db/pool');

/**
 * Verify JWT, load user from DB, attach to req.user.
 * Rejects with 401 if token is missing, malformed, or expired.
 * Rejects with 403 if user account is inactive.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token required', 401, 'TOKEN_MISSING');
    }

    const token = authHeader.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const msg = err.name === 'TokenExpiredError'
        ? 'Token has expired'
        : 'Invalid token';
      throw new AppError(msg, 401, 'TOKEN_INVALID');
    }

    // Load fresh user row — catches deactivated accounts
    const { rows } = await query(
      `SELECT id, name, email, role, is_active, qp_balance, tier,
              quests_completed, quests_posted
         FROM users WHERE id = $1`,
      [payload.sub]
    );

    if (!rows.length) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }
    if (!rows[0].is_active) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Like authenticate but doesn't reject anonymous requests.
 * Sets req.user = null if no valid token present.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    await authenticate(req, res, next);
  } catch {
    req.user = null;
    next();
  }
}

/**
 * Restrict access to specific roles.
 * Must be used AFTER authenticate middleware.
 *
 * @param {...string} roles — e.g. requireRole('admin'), requireRole('admin','senior')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401, 'TOKEN_MISSING'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access restricted to roles: ${roles.join(', ')}`,
          403,
          'FORBIDDEN'
        )
      );
    }
    next();
  };
}

/**
 * Sign a short-lived access token for a user row.
 */
function signToken(user) {
  return jwt.sign(
    {
      sub:  user.id,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { authenticate, optionalAuth, requireRole, signToken };
