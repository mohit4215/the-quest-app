/**
 * constants/levels.js — QP level thresholds (mirrors frontend mockData.js)
 * Single source of truth shared by rewards controller and seed script.
 */

'use strict';

const LEVELS = [
  { name: 'Freshman Quester', tier: 'freshman_quester', emoji: '🌱', minQP: 0,    maxQP: 200   },
  { name: 'Campus Scout',     tier: 'campus_scout',     emoji: '🔍', minQP: 200,  maxQP: 500   },
  { name: 'Silver Quester',   tier: 'silver_quester',   emoji: '🥈', minQP: 500,  maxQP: 1000  },
  { name: 'Gold Quester',     tier: 'gold_quester',     emoji: '🥇', minQP: 1000, maxQP: 2000  },
  { name: 'Quest Master',     tier: 'quest_master',     emoji: '⭐', minQP: 2000, maxQP: 4000  },
  { name: 'Campus Legend',    tier: 'campus_legend',    emoji: '🏆', minQP: 4000, maxQP: Infinity },
];

module.exports = { LEVELS };
