/**
 * response.js — Standardised API response envelope helpers.
 *
 * Every response from this API follows this shape:
 *
 * Success:
 *   { "success": true,  "data": <payload>,  "meta": <optional pagination> }
 *
 * Error:
 *   { "success": false, "error": { "code": "...", "message": "..." } }
 */

'use strict';

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {*}      data
 * @param {number} [statusCode=200]
 * @param {object} [meta]   — pagination, counts, etc.
 */
function sendSuccess(res, data, statusCode = 200, meta = undefined) {
  const body = { success: true, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {string} [code='INTERNAL_ERROR']
 */
function sendError(res, message, statusCode = 500, code = 'INTERNAL_ERROR') {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

module.exports = { sendSuccess, sendError };
