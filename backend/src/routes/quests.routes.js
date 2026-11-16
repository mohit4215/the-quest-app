/**
 * routes/quests.routes.js
 * Base: /quests
 *
 * Route order matters:  /my and /open must come before /:id
 * otherwise Express matches "my" as a UUID param and 404s.
 */
'use strict';

const router   = require('express').Router();
const quests   = require('../controllers/quests.controller');
const claim    = require('../controllers/claim.controller');
const validate = require('../middleware/validate');
const { authenticate }               = require('../middleware/auth');
const { general, claim: claimLimit } = require('../middleware/rateLimiter');

// ── Public ──────────────────────────────────────────────────────────────────
router.get('/',    general, quests.getQuests);

// ── Authenticated ────────────────────────────────────────────────────────────
router.use(authenticate);

router.get('/my',            quests.getMyQuests);
router.get('/scheduled',     quests.getScheduledQuests);
router.get('/vendor/orders', quests.getVendorOrders);

// Maintenance
router.post('/maintenance/timeout-sweep', quests.timeoutSweep);

router.get('/:id',                 quests.getQuestById);
router.get('/:id/upi-intent',      quests.getUpiIntent);
router.get('/:id/suggested-batch', claim.getSuggestedBatch);

router.post('/',
  quests.createValidators, validate,
  quests.createQuest
);

// ── Critical: concurrency-safe claim ────────────────────────────────────────
router.post('/:id/claim',    claimLimit,  claim.claimQuest);

// ── Lifecycle transitions ────────────────────────────────────────────────────
router.post('/:id/pickup',        quests.pickupQuest);
router.post('/:id/complete',      quests.completeQuest);
router.post('/:id/cancel',        quests.cancelQuest);
router.post('/:id/rate',          quests.rateQuest);
router.patch('/:id/vendor-status', quests.updateVendorStatus);

module.exports = router;
