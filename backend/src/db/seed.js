/**
 * db/seed.js — AKGEC campus realistic seed data
 *
 * Usage:
 *   node src/db/seed.js              — wipes & re-seeds (development)
 *   node src/db/seed.js --append     — adds data without wiping
 *
 * Seeds in order (respects FK dependencies):
 *   1. Users   (students + seniors + 1 admin)
 *   2. Quests  (mix of open / claimed / completed)
 *   3. Transactions (ledger entries matching quest history)
 *   4. Community threads + replies + upvotes
 *   5. Perks   (campus shop offers)
 */

'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./pool');

const APPEND = process.argv.includes('--append');
const ROUNDS = 10; // lower than prod for seed speed

// ─────────────────────────────────────────────────────────────────────────────
// 1. RAW DATA DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const RAW_USERS = [
  // ── Admin ──
  {
    name: 'Quest Admin',
    email: 'admin@quest.akgec.ac.in',
    password: 'Admin@1234',
    role: 'admin',
    branch: 'CSE', year: null, hostel: null,
    qp_balance: 9999, quests_completed: 0, quests_posted: 0,
  },

  // ── Seniors (role='senior') ──
  {
    name: 'Rohit Verma',
    email: 'rohit.verma@akgec.ac.in',
    password: 'Senior@1234',
    role: 'senior',
    roll_number: '2100330100101',
    branch: 'CSE', year: 4, hostel: null,
    qp_balance: 3450, quests_completed: 67, quests_posted: 12,
  },
  {
    name: 'Sakshi Jain',
    email: 'sakshi.jain@akgec.ac.in',
    password: 'Senior@1234',
    role: 'senior',
    roll_number: '2100330100102',
    branch: 'IT', year: 4, hostel: 'Girls Hostel',
    qp_balance: 2800, quests_completed: 54, quests_posted: 8,
  },
  {
    name: 'Ankit Pandey',
    email: 'ankit.pandey@akgec.ac.in',
    password: 'Senior@1234',
    role: 'senior',
    roll_number: '2100330100103',
    branch: 'ECE', year: 4, hostel: null,
    qp_balance: 2200, quests_completed: 41, quests_posted: 15,
  },
  {
    name: 'Nidhi Mishra',
    email: 'nidhi.mishra@akgec.ac.in',
    password: 'Senior@1234',
    role: 'senior',
    roll_number: '2100330100104',
    branch: 'CSE', year: 3, hostel: 'Girls Hostel',
    qp_balance: 1650, quests_completed: 28, quests_posted: 6,
  },

  // ── Students ──
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@akgec.ac.in',
    password: 'Student@1234',
    role: 'student',
    roll_number: '2200330100201',
    branch: 'CSE', year: 3, hostel: 'H-1', room_number: '214',
    qp_balance: 1240, quests_completed: 34, quests_posted: 18,
  },
  {
    name: 'Arjun Sharma',
    email: 'arjun.sharma@akgec.ac.in',
    password: 'Student@1234',
    role: 'student',
    roll_number: '2200330100202',
    branch: 'ECE', year: 2, hostel: 'H-2', room_number: '107',
    qp_balance: 780, quests_completed: 19, quests_posted: 22,
  },
  {
    name: 'Sneha Patel',
    email: 'sneha.patel@akgec.ac.in',
    password: 'Student@1234',
    role: 'student',
    roll_number: '2200330100203',
    branch: 'IT', year: 3, hostel: 'Girls Hostel', room_number: '305',
    qp_balance: 620, quests_completed: 15, quests_posted: 9,
  },
  {
    name: 'Priya Mehra',
    email: 'priya.mehra@akgec.ac.in',
    password: 'Student@1234',
    role: 'student',
    roll_number: '2200330100204',
    branch: 'CSE', year: 2, hostel: 'Girls Hostel', room_number: '112',
    qp_balance: 345, quests_completed: 8, quests_posted: 14,
  },
  {
    name: 'Karan Singh',
    email: 'karan.singh@akgec.ac.in',
    password: 'Student@1234',
    role: 'student',
    roll_number: '2200330100205',
    branch: 'ME', year: 4, hostel: 'H-3', room_number: '318',
    qp_balance: 980, quests_completed: 26, quests_posted: 11,
  },
  {
    name: 'Isha Gupta',
    email: 'isha.gupta@akgec.ac.in',
    password: 'Student@1234',
    role: 'student',
    roll_number: '2200330100206',
    branch: 'CSE', year: 1, hostel: 'Girls Hostel', room_number: '404',
    qp_balance: 120, quests_completed: 3, quests_posted: 5,
  },
  {
    name: 'Dev Agarwal',
    email: 'dev.agarwal@akgec.ac.in',
    password: 'Student@1234',
    role: 'student',
    roll_number: '2200330100207',
    branch: 'ECE', year: 3, hostel: 'H-1', room_number: '302',
    qp_balance: 455, quests_completed: 11, quests_posted: 7,
  },
  {
    name: 'Vikram Tiwari',
    email: 'vikram.tiwari@akgec.ac.in',
    password: 'Student@1234',
    role: 'student',
    roll_number: '2200330100208',
    branch: 'CSE', year: 4, hostel: null,
    qp_balance: 1890, quests_completed: 48, quests_posted: 20,
  },
  {
    name: 'Neha Rastogi',
    email: 'neha.rastogi@akgec.ac.in',
    password: 'Student@1234',
    role: 'student',
    roll_number: '2200330100209',
    branch: 'IT', year: 2, hostel: 'Girls Hostel', room_number: '208',
    qp_balance: 290, quests_completed: 7, quests_posted: 12,
  },
  {
    name: 'Amit Yadav',
    email: 'amit.yadav@akgec.ac.in',
    password: 'Student@1234',
    role: 'student',
    roll_number: '2200330100210',
    branch: 'ME', year: 3, hostel: 'H-2', room_number: '220',
    qp_balance: 560, quests_completed: 14, quests_posted: 8,
  },
];

// Drop-off & pickup helpers
const PICKUP_LOCS = [
  'Sachi Street — Tea Stall',
  'Sachi Street — General Store',
  'Sachi Street — Samosa Corner',
  'Sachi Street — Juice Corner',
  'Xerox Shop — Near Gate 2',
  'Stationery Shop — Main Gate',
  'AKGEC Main Canteen',
  'Sachi Street — Cold Drinks Counter',
];

const DROPOFF_LOCS = [
  'Hostel H-1, Room 214',
  'Hostel H-1, Room 302',
  'Hostel H-2, Room 107',
  'Hostel H-2, Room 220',
  'Hostel H-3, Room 318',
  'Girls Hostel, Room 305',
  'Girls Hostel, Room 404',
  'Girls Hostel, Room 208',
  'CSE Block — Lab 2 (3rd Floor)',
  'IT Block — Seminar Hall',
  'ECE Block — Room 104',
  'Library Back Gate',
  'Main Gate — Guard Room',
  'Admin Block — Reception',
];

const RAW_QUEST_TEMPLATES = [
  {
    item: '2× Maggi + Cold Coffee (Sachi Special)',
    pickup: 'Sachi Street — Tea Stall',
    dropoff: 'Hostel H-1, Room 214',
    notes: 'Extra mirchi in Maggi please. Coffee should be cold, not blended.',
    bounty_type: 'qp', bounty_amount: 60, status: 'open',
    requester: 'arjun.sharma@akgec.ac.in',
    courier: null,
  },
  {
    item: 'Frooti × 2 + Lays Classic (Family Pack)',
    pickup: 'Sachi Street — General Store',
    dropoff: 'Hostel H-2, Room 107',
    notes: null,
    bounty_type: 'qp', bounty_amount: 40, status: 'open',
    requester: 'sneha.patel@akgec.ac.in',
    courier: null,
  },
  {
    item: 'Photocopy — Data Structures Assignment (12 pages, single-sided A4)',
    pickup: 'Xerox Shop — Near Gate 2',
    dropoff: 'CSE Block — Lab 2 (3rd Floor)',
    notes: 'Urgent before 2 PM practical.',
    bounty_type: 'qp', bounty_amount: 30, status: 'open',
    requester: 'priya.mehra@akgec.ac.in',
    courier: null,
  },
  {
    item: 'Red Bull (Sugar-free) + Parle-G × 2',
    pickup: 'Sachi Street — Cold Drinks Counter',
    dropoff: 'Hostel H-3, Room 318',
    notes: 'Night-out fuel 🙏 Please hurry.',
    bounty_type: 'qp', bounty_amount: 50, status: 'claimed',
    requester: 'karan.singh@akgec.ac.in',
    courier: 'rahul.verma@akgec.ac.in',
  },
  {
    item: 'Ruled Notebook (200 pages) + Reynolds Pen × 2',
    pickup: 'Stationery Shop — Main Gate',
    dropoff: 'Girls Hostel, Room 404',
    notes: null,
    bounty_type: 'qp', bounty_amount: 45, status: 'open',
    requester: 'isha.gupta@akgec.ac.in',
    courier: null,
  },
  {
    item: 'Samosa × 4 + Masala Chai × 2',
    pickup: 'Sachi Street — Samosa Corner',
    dropoff: 'Hostel H-1, Room 302',
    notes: 'Green chutney separately please.',
    bounty_type: 'qp', bounty_amount: 35, status: 'open',
    requester: 'dev.agarwal@akgec.ac.in',
    courier: null,
  },
  {
    item: 'Fresh Sugarcane Juice × 2 (no ice)',
    pickup: 'Sachi Street — Juice Corner',
    dropoff: 'IT Block — Seminar Hall',
    notes: 'Seminar is at 3 PM. Please deliver before that.',
    bounty_type: 'cash', bounty_amount: 20, status: 'open',
    requester: 'neha.rastogi@akgec.ac.in',
    courier: null,
  },
  {
    item: 'Physics Lab Record (left near xerox counter)',
    pickup: 'Xerox Shop — Near Gate 2',
    dropoff: 'ECE Block — Room 104',
    notes: 'Blue cover file with my name "Arjun" on it.',
    bounty_type: 'qp', bounty_amount: 25, status: 'completed',
    requester: 'arjun.sharma@akgec.ac.in',
    courier: 'vikram.tiwari@akgec.ac.in',
  },
  {
    item: 'Glucose Biscuits (2 packs) + Thumbs Up (500ml)',
    pickup: 'Sachi Street — General Store',
    dropoff: 'Library Back Gate',
    notes: 'Studying for minors. Any brand biscuit is fine.',
    bounty_type: 'qp', bounty_amount: 30, status: 'completed',
    requester: 'vikram.tiwari@akgec.ac.in',
    courier: 'rahul.verma@akgec.ac.in',
  },
  {
    item: 'Lunch Box from Main Canteen (Veg Thali)',
    pickup: 'AKGEC Main Canteen',
    dropoff: 'Girls Hostel, Room 305',
    notes: 'No dal please. Extra roti if possible.',
    bounty_type: 'qp', bounty_amount: 55, status: 'in_transit',
    requester: 'sneha.patel@akgec.ac.in',
    courier: 'dev.agarwal@akgec.ac.in',
  },
  {
    item: 'Fevicol Tube + A4 Coloured Chart Paper × 3',
    pickup: 'Stationery Shop — Main Gate',
    dropoff: 'CSE Block — Lab 2 (3rd Floor)',
    notes: 'For project model. Any colour chart paper.',
    bounty_type: 'qp', bounty_amount: 40, status: 'open',
    requester: 'amit.yadav@akgec.ac.in',
    courier: null,
  },
  {
    item: 'Sandwich × 2 + Nimbu Paani × 2',
    pickup: 'AKGEC Main Canteen',
    dropoff: 'Admin Block — Reception',
    notes: 'One sandwich veg, one paneer. Nimbu paani without sugar.',
    bounty_type: 'cash', bounty_amount: 30, status: 'open',
    requester: 'nidhi.mishra@akgec.ac.in',
    courier: null,
  },
];

const RAW_THREADS = [
  {
    author:  'vikram.tiwari@akgec.ac.in',
    title:   'How do I crack the AKGEC placement process for product companies?',
    body:    `I'm in 4th year CSE and targeting Amazon/Flipkart. Currently doing DSA on LeetCode but not sure if that's enough. What was your strategy? How many questions did you solve before getting a call? Any mock interview tips specific to AKGEC's past placement drives would be really helpful.`,
    tag:     'placements',
    upvotes: 42,
    replies: [
      { author: 'rohit.verma@akgec.ac.in', body: `Focus on Striver's SDE sheet — 180 questions, categorised. AKGEC typically has 3 rounds: OA (MCQ+DSA), technical (2 rounds), HR. For Amazon specifically, prepare all 14 leadership principles with STAR stories. Mock interviews with your batchmates weekly makes a huge difference. I did 250+ LC before getting my offer.`, is_accepted: true },
      { author: 'sakshi.jain@akgec.ac.in', body: 'Also prepare your projects really well. Both of my technical rounds were 60% project deep-dives. Put only what you can defend in depth on your resume.' },
    ],
  },
  {
    author:  'neha.rastogi@akgec.ac.in',
    title:   'Is it worth attending morning practical if the submission is at 5 PM same day?',
    body:    `CSE 2nd year here. We have a 8 AM lab practical and the record submission deadline is 5 PM today. I stayed up writing the record till 3 AM. The practical is just a viva and running the program — sir usually doesn't care much. Should I attend or get some sleep and submit the record on time? What do seniors usually do?`,
    tag:     'academics',
    upvotes: 31,
    replies: [
      { author: 'ankit.pandey@akgec.ac.in', body: 'Attendance is attendance — if you\'re already at the borderline, don\'t skip. But if you have margin, sleeping and submitting a clean record is better long-term. Most lab teachers give internal marks based on record quality more than viva.' },
    ],
  },
  {
    author:  'rahul.verma@akgec.ac.in',
    title:   'Best resources for DSA prep alongside 7th semester coursework?',
    body:    `7th sem here and the coursework load is real (TOC, Compiler Design, CN lab). But I also need to do serious DSA prep for placements in December. Currently trying to do 3 LC problems a day but falling behind on assignments. What's a realistic schedule? Any resources specifically for C++ that don't require starting from scratch?`,
    tag:     'dsa',
    upvotes: 67,
    replies: [
      { author: 'rohit.verma@akgec.ac.in', body: 'I was in the exact same boat. Here\'s what worked: 2 LC problems a day (1 medium, 1 easy) on weekdays, 4-5 on weekends. Use the NeetCode 150 roadmap — it\'s structured by pattern. For C++, Luv Babbar\'s DSA series on YouTube is AKGEC-friendly since he explains time complexity really well. Don\'t skip arrays/strings/trees/graphs — those are AKGEC placement favorites.', is_accepted: true },
      { author: 'nidhi.mishra@akgec.ac.in', body: 'Supplement with Codeforces Div 2 A and B problems on weekends for speed. Also do at least one full-length OA mock per week using previous AKGEC placement papers (check the TPO noticeboard).' },
      { author: 'vikram.tiwari@akgec.ac.in', body: 'Set a hard cutoff. DSA from 9-11 PM every day no matter what. Treat it like a class. Consistency over intensity.' },
    ],
  },
  {
    author:  'amit.yadav@akgec.ac.in',
    title:   'Which optional subjects in 5th sem give the most attendance buffer?',
    body:    `Going into 5th sem. Need to choose between Soft Computing, Operations Research, and Advanced Java. Which one has the most lenient attendance policy in AKGEC based on experience? Also which is easiest to score above 80% in internally?`,
    tag:     'academics',
    upvotes: 18,
    replies: [
      { author: 'sakshi.jain@akgec.ac.in', body: 'Advanced Java if you already know Java basics. The lab component is easy and the teacher gives generous internal marks for mini projects. OR is conceptually heavy and the teacher is strict. Soft Computing mid-sem paper is unpredictable.' },
    ],
  },
  {
    author:  'isha.gupta@akgec.ac.in',
    title:   'Complete guide to clearing 1st year backlogs at AKGEC — what actually works?',
    body:    `1st year CSE. Got a backlog in Engineering Physics (3 credits). Exam is in 2 months. Never actually understood the syllabus properly during the semester. Which chapters should I prioritise? Are there any seniors who cleared physics backlog recently who can share notes or strategy?`,
    tag:     'backlog',
    upvotes: 24,
    replies: [
      { author: 'ankit.pandey@akgec.ac.in', body: 'Physics backlog at AKGEC usually covers Unit 1 (Quantum Mechanics basics), Unit 3 (Laser & Fiber Optics), Unit 4 (Dielectrics) and Unit 5 (Magnetic materials). Units 3 and 5 are the most scoring — pure theory, memorise diagrams and derivations. Unit 1 is conceptual but the questions repeat from previous years. I\'ll DM you PYQs.', is_accepted: true },
    ],
  },
  {
    author:  'priya.mehra@akgec.ac.in',
    title:   'Internship hunt in 2nd year — how to stand out with no experience?',
    body:    `2nd year CSE. Applying for summer internships but most places want "1 year experience" which makes no sense. My resume has 1 college project (a basic CRUD app) and some Hackerrank certificates. Is there any AKGEC-specific channel for off-campus internships? What do seniors recommend building to get noticed?`,
    tag:     'internships',
    upvotes: 39,
    replies: [
      { author: 'sakshi.jain@akgec.ac.in', body: 'Build one real project end-to-end and deploy it. Not a tutorial project — something that solves an actual problem. It doesn\'t need to be complex. A "AKGEC mess menu tracker" or "lab slot booking system" is more impressive than a generic todo app because you can talk about real constraints. Post it on GitHub and make the README excellent. Then cold-email startups directly. I got my Microsoft intern this way.', is_accepted: true },
      { author: 'nidhi.mishra@akgec.ac.in', body: 'LinkedIn is massively underused by AKGEC students. Connect with AKGEC alumni who are in target companies and ask for a 15-min coffee chat (virtually). Referrals make the process 10x easier. Most alumni are happy to help if you ask genuinely and not just "please refer me."' },
    ],
  },
];

const RAW_PERKS = [
  {
    shop_name: 'Sachi Dhaba',
    emoji: '🍽️',
    offer_text: '₹30 off on any order above ₹100',
    qp_cost: 50,
    category: 'food',
  },
  {
    shop_name: 'Sachi Street Tea Stall',
    emoji: '☕',
    offer_text: '1 free Cutting Chai (any time)',
    qp_cost: 20,
    category: 'beverages',
  },
  {
    shop_name: 'Gate 2 Xerox Shop',
    emoji: '🖨️',
    offer_text: '20 pages free photocopy (A4, single-sided)',
    qp_cost: 30,
    category: 'stationery',
  },
  {
    shop_name: 'Campus Juice Corner',
    emoji: '🥤',
    offer_text: 'Buy 1 Get 1 Free on any fresh juice',
    qp_cost: 40,
    category: 'beverages',
  },
  {
    shop_name: 'Main Gate General Store',
    emoji: '🛒',
    offer_text: '10% discount on any purchase',
    qp_cost: 35,
    category: 'general',
  },
  {
    shop_name: 'Sachi Street Samosa Corner',
    emoji: '🥟',
    offer_text: 'Samosa × 4 for the price of 2',
    qp_cost: 25,
    category: 'food',
  },
  {
    shop_name: 'AKGEC Main Canteen',
    emoji: '🏫',
    offer_text: '₹20 off on Veg Thali',
    qp_cost: 45,
    category: 'food',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. SEED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function wipe(client) {
  console.log('  Wiping existing seed data...');
  // Order matters: FK children first
  await client.query('DELETE FROM perk_redemptions');
  await client.query('DELETE FROM perks');
  await client.query('DELETE FROM thread_upvotes');
  await client.query('DELETE FROM thread_replies');
  await client.query('DELETE FROM community_threads');
  await client.query('DELETE FROM transactions');
  await client.query('DELETE FROM quests');
  // Disable trigger temporarily to allow deleting users with balance > 0
  await client.query('ALTER TABLE users DISABLE TRIGGER trg_sync_tier');
  await client.query("DELETE FROM users WHERE email LIKE '%@akgec.ac.in' OR email LIKE '%@quest.akgec.ac.in'");
  await client.query('ALTER TABLE users ENABLE TRIGGER trg_sync_tier');
  console.log('  Wipe complete.');
}

async function seedUsers(client) {
  console.log('  Seeding users...');
  const inserted = {};

  for (const u of RAW_USERS) {
    const hash = await bcrypt.hash(u.password, ROUNDS);
    const { rows } = await client.query(
      `INSERT INTO users
         (name, email, password_hash, role, roll_number, branch, year,
          hostel, room_number, qp_balance, quests_completed, quests_posted,
          is_verified, is_active, last_seen_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE,TRUE,
               NOW() - (random() * INTERVAL '2 hours'))
       RETURNING id, email`,
      [
        u.name, u.email, hash, u.role,
        u.roll_number ?? null, u.branch, u.year ?? null,
        u.hostel ?? null, u.room_number ?? null,
        u.qp_balance, u.quests_completed, u.quests_posted,
      ]
    );
    inserted[u.email] = rows[0].id;
    process.stdout.write(`    ✔ ${u.name} (${u.role})\n`);
  }

  return inserted;
}

async function seedQuests(client, userMap) {
  console.log('  Seeding quests...');
  const questIds = {};

  for (const q of RAW_QUEST_TEMPLATES) {
    const requesterId = userMap[q.requester];
    const courierId   = q.courier ? userMap[q.courier] : null;

    if (!requesterId) {
      console.warn(`    ⚠ Skipping quest — requester not found: ${q.requester}`);
      continue;
    }

    // Insert with status='open' first (trigger allows open as initial)
    const { rows } = await client.query(
      `INSERT INTO quests
         (requester_id, item_description, notes,
          pickup_location, dropoff_location,
          bounty_type, bounty_amount, courier_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [
        requesterId, q.item, q.notes ?? null,
        q.pickup, q.dropoff,
        q.bounty_type, q.bounty_amount,
        null, // always null on insert — update below
      ]
    );
    const questId = rows[0].id;
    questIds[q.item] = questId;

    // Advance status through valid transitions
    if (q.status !== 'open') {
      // open → claimed
      await client.query(
        `UPDATE quests SET status='claimed', courier_id=$2 WHERE id=$1`,
        [questId, courierId]
      );
    }
    if (q.status === 'in_transit') {
      await client.query(
        `UPDATE quests SET status='in_transit' WHERE id=$1`,
        [questId]
      );
    }
    if (q.status === 'completed') {
      await client.query(
        `UPDATE quests SET status='in_transit' WHERE id=$1`,
        [questId]
      );
      await client.query(
        `UPDATE quests SET status='completed' WHERE id=$1`,
        [questId]
      );
    }

    process.stdout.write(`    ✔ "${q.item.slice(0, 50)}" [${q.status}]\n`);
  }

  return questIds;
}

async function seedTransactions(client, userMap, questIds) {
  console.log('  Seeding transactions...');

  // Build representative ledger entries for completed quests
  const completedPairs = [
    {
      item:      'Physics Lab Record (left near xerox counter)',
      requester: 'arjun.sharma@akgec.ac.in',
      courier:   'vikram.tiwari@akgec.ac.in',
      amount:    25,
    },
    {
      item:      'Glucose Biscuits (2 packs) + Thumbs Up (500ml)',
      requester: 'vikram.tiwari@akgec.ac.in',
      courier:   'rahul.verma@akgec.ac.in',
      amount:    30,
    },
  ];

  for (const p of completedPairs) {
    const questId   = questIds[p.item];
    const courierId = userMap[p.courier];
    if (!questId || !courierId) continue;

    // Get current courier balance (was already incremented in seedUsers via qp_balance)
    // Just record the historical ledger entry
    const { rows } = await client.query(
      'SELECT qp_balance FROM users WHERE id=$1', [courierId]
    );
    const bal = rows[0].qp_balance;

    // Disable immutability trigger for seeding
    await client.query('ALTER TABLE transactions DISABLE TRIGGER trg_txn_no_update');
    await client.query('ALTER TABLE transactions DISABLE TRIGGER trg_txn_no_delete');

    await client.query(
      `INSERT INTO transactions
         (user_id, type, amount, balance_before, balance_after,
          quest_id, description)
       VALUES ($1,'quest_earned',$2,$3,$4,$5,$6)`,
      [
        courierId, p.amount,
        bal - p.amount, bal,
        questId,
        `Quest completed: ${p.item.slice(0, 60)}`,
      ]
    );

    // Re-enable triggers
    await client.query('ALTER TABLE transactions ENABLE TRIGGER trg_txn_no_update');
    await client.query('ALTER TABLE transactions ENABLE TRIGGER trg_txn_no_delete');

    process.stdout.write(`    ✔ Txn: ${p.courier} earned ${p.amount} QP\n`);
  }
}

async function seedCommunity(client, userMap) {
  console.log('  Seeding community threads...');

  for (const t of RAW_THREADS) {
    const authorId = userMap[t.author];
    if (!authorId) continue;

    const { rows } = await client.query(
      `INSERT INTO community_threads (author_id, title, body, tag)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [authorId, t.title, t.body, t.tag]
    );
    const threadId = rows[0].id;

    // Insert replies
    for (const r of (t.replies || [])) {
      const replyAuthorId = userMap[r.author];
      if (!replyAuthorId) continue;

      const { rows: rRows } = await client.query(
        `INSERT INTO thread_replies (thread_id, author_id, body)
         VALUES ($1,$2,$3) RETURNING id`,
        [threadId, replyAuthorId, r.body]
      );

      if (r.is_accepted) {
        await client.query(
          'UPDATE thread_replies SET is_accepted=TRUE WHERE id=$1',
          [rRows[0].id]
        );
        await client.query(
          'UPDATE community_threads SET is_answered=TRUE WHERE id=$1',
          [threadId]
        );
      }
    }

    // Simulate upvotes (distribute among random users)
    const voters = Object.values(userMap).slice(0, Math.min(t.upvotes, Object.values(userMap).length));
    for (const voterId of voters) {
      if (voterId === authorId) continue;
      await client.query(
        `INSERT INTO thread_upvotes (user_id, thread_id)
         VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [voterId, threadId]
      );
    }

    process.stdout.write(`    ✔ Thread: "${t.title.slice(0, 55)}..."\n`);
  }
}

async function seedPerks(client) {
  console.log('  Seeding perks...');

  for (const p of RAW_PERKS) {
    await client.query(
      `INSERT INTO perks (shop_name, emoji, offer_text, qp_cost, category)
       VALUES ($1,$2,$3,$4,$5)`,
      [p.shop_name, p.emoji, p.offer_text, p.qp_cost, p.category]
    );
    process.stdout.write(`    ✔ Perk: ${p.shop_name} — ${p.offer_text}\n`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MAIN RUNNER
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  const client = await pool.connect();
  console.log('\n🌱 Quest AKGEC Seed Script\n');

  try {
    await client.query('BEGIN');

    if (!APPEND) await wipe(client);

    const userMap  = await seedUsers(client);
    const questIds = await seedQuests(client, userMap);
    await seedTransactions(client, userMap, questIds);
    await seedCommunity(client, userMap);
    await seedPerks(client);

    await client.query('COMMIT');

    console.log('\n✅ Seed complete!\n');
    console.log('Test credentials (all passwords follow the pattern in .env.example):');
    console.log('  admin@quest.akgec.ac.in     / Admin@1234');
    console.log('  rohit.verma@akgec.ac.in     / Senior@1234  (senior)');
    console.log('  rahul.verma@akgec.ac.in     / Student@1234 (student, Gold Quester)');
    console.log('  arjun.sharma@akgec.ac.in    / Student@1234 (student)');
    console.log('');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
