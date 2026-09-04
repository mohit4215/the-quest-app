/**
 * controllers/auth.controller.js
 * POST /auth/register  — create account
 * POST /auth/login     — issue JWT
 * GET  /auth/me        — current user profile
 */

'use strict';

const bcrypt       = require('bcryptjs');
const { body }     = require('express-validator');
const { query }    = require('../db/pool');
const AppError     = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { signToken }   = require('../middleware/auth');

// ── Validators ────────────────────────────────────────────────────────────────
const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('roll_number').optional().trim(),
  body('branch').optional().trim(),
  body('year').optional().isInt({ min: 1, max: 5 }),
  body('hostel').optional().trim(),
  body('room_number').optional().trim(),
];

const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// ── Handlers ──────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const {
    name, email, password,
    roll_number, branch, year, hostel, room_number,
  } = req.body;

  const { rows: existing } = await query(
    'SELECT id FROM users WHERE email = $1', [email]
  );
  if (existing.length) {
    throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS) || 12;
  const password_hash = await bcrypt.hash(password, rounds);

  const { rows } = await query(
    `INSERT INTO users
       (name, email, password_hash, roll_number, branch, year, hostel, room_number)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, name, email, role, qp_balance, tier, created_at`,
    [name, email, password_hash, roll_number ?? null, branch ?? null,
     year ?? null, hostel ?? null, room_number ?? null]
  );

  const user  = rows[0];
  const token = signToken(user);

  return sendSuccess(res, { user, token }, 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await query(
    `SELECT id, name, email, role, password_hash, is_active,
            qp_balance, tier, quests_completed, quests_posted
       FROM users WHERE email = $1`,
    [email]
  );

  const user = rows[0];
  if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  if (!user.is_active) throw new AppError('Account deactivated', 403, 'ACCOUNT_INACTIVE');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  // Update last_seen
  await query('UPDATE users SET last_seen_at = NOW() WHERE id = $1', [user.id]);

  const { password_hash: _, ...safeUser } = user;
  const token = signToken(safeUser);

  return sendSuccess(res, { user: safeUser, token });
});

const me = asyncHandler(async (req, res) => {
  // req.user already loaded by authenticate middleware
  return sendSuccess(res, { user: req.user });
});

module.exports = {
  register, registerValidators,
  login,    loginValidators,
  me,
};
