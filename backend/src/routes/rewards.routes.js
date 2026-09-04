/**
 * routes/rewards.routes.js
 * Base: /rewards
 */
'use strict';

const router   = require('express').Router();
const ctrl     = require('../controllers/rewards.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get( '/balance',       ctrl.getBalance);
router.get( '/transactions',  ctrl.getTransactions);
router.get( '/perks',         ctrl.getPerks);
router.post('/redeem',        ctrl.redeemValidators, validate, ctrl.redeemPerk);

module.exports = router;
