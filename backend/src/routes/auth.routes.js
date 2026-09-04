/**
 * routes/auth.routes.js
 * Base: /auth
 */
'use strict';

const router   = require('express').Router();
const ctrl     = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authenticate }    = require('../middleware/auth');
const { auth: authLimit } = require('../middleware/rateLimiter');

router.post('/register', authLimit, ctrl.registerValidators, validate, ctrl.register);
router.post('/login',    authLimit, ctrl.loginValidators,    validate, ctrl.login);
router.get( '/me',       authenticate, ctrl.me);

module.exports = router;
