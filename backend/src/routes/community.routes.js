/**
 * routes/community.routes.js
 * Base: /community
 */
'use strict';

const router   = require('express').Router();
const ctrl     = require('../controllers/community.controller');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');

// ── Public (read-only) ────────────────────────────────────────────────────────
router.get('/threads',          optionalAuth, ctrl.getThreads);
router.get('/threads/:id',      optionalAuth, ctrl.getThreadById);
router.get('/seniors',          ctrl.getSeniors);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.use(authenticate);

router.post('/threads',
  ctrl.createThreadValidators, validate,
  ctrl.createThread
);
router.post('/threads/:id/replies',
  ctrl.createReplyValidators, validate,
  ctrl.createReply
);
router.post('/threads/:id/upvote',    ctrl.upvoteThread);
router.post('/replies/:id/upvote',    ctrl.upvoteReply);
router.post('/replies/:id/accept',    ctrl.acceptReply);

module.exports = router;
