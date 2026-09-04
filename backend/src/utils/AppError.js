/**
 * AppError — typed operational error with HTTP status and optional error code.
 * Distinguishes between "safe to expose to client" errors and programming bugs.
 *
 * Usage:
 *   throw new AppError('Quest not found', 404, 'QUEST_NOT_FOUND');
 */

'use strict';

class AppError extends Error {
  /**
   * @param {string} message     — Human-readable message sent in API response
   * @param {number} statusCode  — HTTP status code
   * @param {string} [code]      — Machine-readable error code for clients
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name        = 'AppError';
    this.statusCode  = statusCode;
    this.code        = code;
    this.isOperational = true;   // expected error, not a programming bug
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
