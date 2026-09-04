/**
 * middleware/validate.js — express-validator result checker
 *
 * Place at the END of a validator chain:
 *   router.post('/quests', [...validators], validate, controller)
 *
 * Forwards a clean error array to the error handler if validation fails.
 */

'use strict';

const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  // Forward as an array — errorHandler detects this shape
  return next(errors.array({ onlyFirstError: true }));
}

module.exports = validate;
