/**
 * asyncHandler — wraps async route handlers so we don't need try/catch
 * in every controller. Forwards any thrown error to Express error middleware.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }));
 */

'use strict';

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
