# Quest ⚡ — Campus P2P Micro-Delivery & Errand Network

> **Solving the "Last-500-Meter Campus Delivery Problem"** through a hyper-local, gamified, peer-to-peer micro-delivery network built specifically for residential university campuses and hostels.

---

## 📖 Table of Contents
- [Overview](#-overview)
- [The Problem: Campus Last-500m Dilemma](#-the-problem-campus-last-500m-dilemma)
- [The Solution: Footpath Liquidity](#-the-solution-footpath-liquidity)
- [Key Features](#-key-features)
  - [Dual-Mode Architecture (Lazy vs Quester)](#1-dual-mode-architecture)
  - [Live Campus Radar & Heatmaps](#2-live-campus-radar)
  - [4-Step Delivery Pipeline with OTP Handshake](#3-4-step-delivery-pipeline)
  - [Gamified Campus Economy & Leaderboards](#4-gamified-campus-economy)
  - [Community Q&A / Senior Connect](#5-community-qa--senior-connect)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Database Schema & State Machine](#-database-schema--state-machine)
- [API Reference](#-api-reference)
- [Socket.io Real-Time Events](#-socketio-real-time-events)
- [Installation & Getting Started](#-installation--getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend / Mobile App Setup](#frontend--mobile-app-setup)
- [Configuration (.env)](#-configuration-env)
- [Contributing & License](#-contributing--license)

---

## ⚡ Overview

**Quest** is a cross-platform (React Native / Expo + Node.js / PostgreSQL) peer-to-peer micro-delivery and errand platform designed for university students. 

Traditional delivery platforms (Zomato, Swiggy, Blinkit, Amazon) are barred by campus security rules from entering student residential zones, leaving packages at the main security gate. Quest unlocks the latent **"footpath liquidity"** of students already walking back from campus gates, central xerox shops, day canteens, and lecture halls, while creating a secure escrow network for high-margin academic micro-gigs (handwritten lab manuals, assignments, and engineering drawing sheets).

---

## 🚨 The Problem: Campus Last-500m Dilemma

On residential university campuses:
1. **The Walk of Dread**: Picking up a midnight snack, parcel, or urgent medicine requires a 15–25 minute round-trip walk (800m – 1.5km) in extreme weather or late night hours.
2. **High Friction for Micro-Needs**: Buying a ₹20 pack of Maggi, getting ₹10 printouts, or grabbing a cold drink takes 30–45 minutes of walking and waiting.
3. **Wasted Footpath Liquidity**: At any given minute, hundreds of students are walking the exact same corridors and pathways empty-handed.
4. **Awkward Social Debt**: Asking wing-mates or batchmates via WhatsApp or Telegram groups leads to missed messages, guilt, and awkward money transfers.

---

## 💡 The Solution: Footpath Liquidity

Quest bridges this gap by creating a friction-free, gamified campus marketplace:

```
┌────────────────────────────────────────────────────────┐
│               [🛋️ Lazy]   ⚡   [🏃 Quester]             │  <-- Mode Switch
└────────────────────────────────────────────────────────┘
```

Students toggle between two roles seamlessly based on what they are doing at any moment:
- **🛋️ Lazy Mode** (`#7C3AED` Purple): Relax in your hostel room, order whatever you need (food, gate deliveries, xerox copies, stationery), attach a bounty (Quest Points or cash tip), and verify delivery with a secure OTP.
- **🏃 Quester Mode** (`#10B981` Green): Walking back to the hostel from the gate or canteen? Check your live radar feed for nearby bounties along your path, claim tasks, drop them off at your hostel wing, and earn instant cash + Quest Points.

---

## ✨ Key Features

### 1. Dual-Mode Architecture
- Instant toggle between **Lazy Mode** (Requester) and **Quester Mode** (Courier).
- The entire interface dynamically adapts its theme accents, primary actions, and live feeds to match the active role.

### 2. Live Campus Radar
- Real-time pulse indicator showing active peer concentration and open tasks at key campus hotspots:
  - 🍕 *Night Canteen / Food Kiosks*
  - 📦 *Main Security Gate (Swiggy / Zomato / Amazon drop-off points)*
  - 🖨️ *Stationery & Xerox Centers*
  - 🏫 *Academic Blocks & Department Labs*

### 3. 4-Step Delivery Pipeline
Deliveries follow a strict, reliable state machine:
```
[1. Open] ──► [2. Claimed] ──► [3. In Transit / Walking] ──► [4. Delivered (OTP Verified)]
```
- **Concurrency-Safe Claiming**: Backed by PostgreSQL `FOR UPDATE SKIP LOCKED` to prevent race conditions when multiple runners tap to claim the same bounty.
- **In-App Quick Replies**: One-tap runner status updates (*"At shop counter"*, *"Heading to your hostel"*, *"Item out of stock"*).
- **Secure 4-Digit Handshake OTP**: The requester shares a 4-digit OTP only upon receiving the item at their door, releasing the reward payout automatically.

### 4. Gamified Campus Economy
- **Quest Points (QP)**: Earn QP for every completed errand, fast response, or accepted community answer.
- **Tier Progression**:
  - `freshman_quester` (0–199 QP)
  - `campus_scout` (200–499 QP)
  - `silver_quester` (500–999 QP)
  - `gold_quester` (1000–1999 QP)
  - `quest_master` (2000–3999 QP)
  - `campus_legend` (4000+ QP)
- **Hostel Championship Leaderboard**: Real-time competition between hostels (e.g., *BH-1 vs BH-2 vs GH-1*) to foster organic campus spirit.
- **Campus Perks Store**: Redeem QP balance for canteen vouchers, exclusive hostel badges, and delivery fee waivers.

### 5. Community Q&A / Senior Connect
- Built-in campus forum for peer mentorship, subject notes, past-year exam questions, and hostel advice.
- Upvote mechanisms and "Accepted Solution" badges that reward helpful seniors with bonus QP.

---

## ⚡ Campus Production Scale Upgrades (Friction Solvers)

To transition Quest from a campus prototype to a viral production network, six physical and financial friction points have been engineered:

### 1. Multi-Order Route Batching
- **The Upgrade**: A Quester walking from the Main Gate or Canteen can hold up to **3 active quests simultaneously**.
- **Backend Guard**: Concurrency state machine enforces `max 3 active orders` per courier and provides a `GET /api/v1/quests/:id/suggested-batch` endpoint.
- **Route Add-on UI**: Runners receive intelligent route alerts when another parcel or snack order shares their destination hostel wing (e.g., *"1 Flipkart parcel waiting at Main Gate for BH-2 Room 218! +₹35 tip / +55 QP"*).

### 2. Frictionless UPI Deep-Linking (`upi://pay`)
- **The Upgrade**: Completely eliminates the awkward "share your QR scanner" dance at the hostel door.
- **Dynamic Intent**: Generates standard UPI intent links:
  ```
  upi://pay?pa=courier@oksbi&pn=CourierName&am=80.00&tn=Quest+Settlement&cu=INR
  ```
- **Automated Breakdown**: Combines shop/canteen item reimbursement (e.g. ₹50) + courier tip (e.g. ₹30) = ₹80 total, opening Google Pay, PhonePe, or Paytm with 1 tap.

### 3. Scheduled / Pre-Order Quests
- **The Upgrade**: Supports non-urgent morning runs (e.g. *"Print Lab Manual & Spiral Bound from Xerox shop and deliver to BH-1 by 8:45 AM tomorrow"*).
- **Schema**: Backed by `scheduled_for` timestamp in `quests`. Couriers claim scheduled quests the night before, locking in guaranteed earnings for their morning walk to class.

### 4. B2B2C Vendor Dashboard (Day Canteen & Xerox Queue)
- **The Upgrade**: Specialized web and in-app portal for Campus Day Canteens, Nescafe stalls, and Central Xerox centers.
- **Order Token Dispatch**: Vendors mark orders as `PREPARING` or `READY FOR PICKUP (Token #22)`. Runners receive real-time Socket.io alerts when their order is packed, eliminating queue wait times.

### 5. Trust, Safety & Dispute Resolution
- **30-Minute Auto-Release Timeout**: If a courier claims a quest but fails to advance status within 30 minutes, `POST /api/v1/quests/maintenance/timeout-sweep` automatically un-claims the task and releases it back to the radar.
- **5-Star Rating & Penalties**: Requesters submit a 1–5 star rating upon OTP verification. Couriers dropping below a **3.5 average rating** are automatically suspended from claiming tasks.

### 6. Push Notifications & Live Background GPS
- **Expo Notifications**: Sends push notifications for door-step arrivals, high-bounty gate parcels, and vendor ready signals.
- **Live Location Tracking**: Uses `expo-location` to transmit courier corridor coordinates to the requester during `in_transit` state.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Cross-Platform Clients                    │
│      React Native (Expo) — Android / iOS / Web Browser       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST & WebSocket (WS)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Node.js / Express API                    │
│  ├── Helmet, CORS, Morgan, Rate Limiting                     │
│  ├── JWT Authentication & Role Authorization                │
│  ├── Express-Validator (Request Sanitization)              │
│  └── Socket.io Server (Real-Time Radar & Delivery Rooms)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database Engine                 │
│  ├── Native UUIDs (pgcrypto) & Text Search (pg_trgm)        │
│  ├── Concurrency Controls (FOR UPDATE SKIP LOCKED)          │
│  ├── Automated Triggers (Tier Sync, Reply & Upvote Sync)    │
│  └── Immutable Ledger Transactions (QP Credits & Debits)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

### Frontend (Mobile & Web)
| Technology | Description |
| :--- | :--- |
| **React Native (0.74.1)** | Core mobile application framework |
| **Expo SDK (v51)** | Build tooling, runtime, and cross-platform native abstractions |
| **React Native Web** | Seamless single-codebase desktop and mobile web rendering |
| **React Navigation 6** | Bottom Tabs & Native Stack routing |
| **Expo Linear Gradient** | Visual cards and accent badges |
| **React Native SVG** | Scalable icons and radar illustrations |

### Backend & Database
| Technology | Description |
| :--- | :--- |
| **Node.js (>=18) & Express** | RESTful HTTP microservice framework |
| **PostgreSQL (v14+)** | Relational database with transactional consistency |
| **Socket.io (v4.7)** | Low-latency bi-directional event broadcasts |
| **JWT & bcryptjs** | Secure token-based authentication and password hashing |
| **pg (node-postgres)** | PostgreSQL connection pooling and transaction clients |
| **express-rate-limit** | Protection against brute-force and request flooding |

---

## 📂 Repository Structure

```
the-quest-app/
├── App.js                      # Root React Native / Expo bootstrap component
├── app.json                    # Expo configuration & app manifest
├── babel.config.js             # Babel compiler presets
├── index.html                  # Web entry point
├── package.json                # Frontend dependencies and scripts
├── PITCH_DECK.md               # Investor & project pitch deck
├── src/                        # Frontend source code
│   ├── components/
│   │   ├── common/             # Reusable UI primitives (AppHeader, Avatar, Card, QPBadge, etc.)
│   │   └── quest/              # Feature components (BountyCard, LiveCampusRadar, PostQuestModal)
│   ├── constants/              # Global colors, typography, spacing tokens
│   ├── context/                # QuestModeContext (Lazy vs Quester global state)
│   ├── data/                   # Mock campus and feed datasets for rapid prototyping
│   ├── navigation/             # RootNavigator (Stack) & TabNavigator (Bottom Tabs)
│   └── screens/                # Core screens:
│       ├── HomeFeedScreen.jsx       # Campus radar, active bounties, and category filters
│       ├── ActiveQuestScreen.jsx    # 4-step real-time delivery tracking & OTP verification
│       ├── LeaderboardScreen.jsx    # Inter-hostel rankings & individual MVP scores
│       ├── PostQuestScreen.jsx      # Quest creation & dynamic bounty calculator
│       ├── RewardsScreen.jsx        # QP Perks & Canteen voucher redemption
│       └── ForumScreen.jsx          # Senior Connect campus discussion boards
│
└── backend/                    # Backend API source code
    ├── package.json            # Backend dependencies and scripts
    ├── .env.example            # Environment variable template
    └── src/
        ├── app.js              # Express app factory (middleware, routes, error handlers)
        ├── server.js           # HTTP + Socket.io server bootstrapper
        ├── constants/          # Gamification level definitions and tier bounds
        ├── controllers/        # Request handlers (auth, claim, quests, rewards, community)
        ├── db/                 # Database migrations, seed scripts, and connection pool
        │   ├── pool.js         # PostgreSQL connection pool configuration
        │   ├── migrate.js      # Migration runner
        │   ├── seed.js         # Dummy data generator for campus testing
        │   └── migrations/     # SQL migration files (001 to 005)
        ├── middleware/         # Auth verification, rate limiters, validation, error handler
        ├── routes/             # REST endpoint routers (/auth, /quests, /rewards, /community)
        ├── socket/             # Socket.io connection lifecycle & room event handlers
        └── utils/              # AppError class, async wrapper, and standardized API response
```

---

## 🗄️ Database Schema & State Machine

The database is built on relational integrity and ACID guarantees:

### Core Tables
1. **`users`**: Manages auth credentials, campus profile (roll number, hostel, wing, room number), QP balance, and automated gamification tiers.
2. **`quests`**: Central errand ledger holding pickup/drop locations, item descriptions, bounty amounts (`qp` or `cash`), status lifecycle, and OTP secrets.
3. **`transactions`**: Double-entry ledger for QP transactions (bounties earned, spent, refunds, and redemptions).
4. **`community_threads` & `thread_replies`**: Discussion board with automated upvote and reply counts via database triggers.
5. **`perks` & `perk_redemptions`**: Campus shop discounts redeemable for QP with unique 8-character verification receipts.

### Quest Lifecycle
```
       [Open]
         │
         │ (Courier claims: FOR UPDATE SKIP LOCKED)
         ▼
     [Claimed]
         │
         │ (Picked up at vendor/gate)
         ▼
    [In Transit]
         │
         │ (Courier enters Requester's 4-digit OTP)
         ▼
    [Completed] ──► (Instant QP/Cash payout settled)
```

---

## 🔌 API Reference

All backend routes are prefixed with `/api/v1`.

### Authentication (`/auth`)
- `POST /api/v1/auth/register` — Register a student account with campus email & hostel details.
- `POST /api/v1/auth/login` — Authenticate and receive JWT access and refresh tokens.
- `GET /api/v1/auth/me` — Retrieve authenticated user profile and QP balance.
- `POST /api/v1/auth/refresh` — Refresh expired access token.

### Quests & Errands (`/quests`)
- `GET /api/v1/quests` — Fetch active campus quests (supports category, status, and hostel filters).
- `POST /api/v1/quests` — Post a new errand request.
- `GET /api/v1/quests/:id` — Retrieve quest details and live status.
- `POST /api/v1/quests/:id/claim` — Concurrency-safe errand claiming by a runner.
- `PATCH /api/v1/quests/:id/status` — Advance errand state (`in_transit`).
- `POST /api/v1/quests/:id/complete` — Finalize delivery using requester's 4-digit OTP.
- `POST /api/v1/quests/:id/cancel` — Cancel an unclaimed quest with automatic bounty refund.

### Rewards & Leaderboard (`/rewards`)
- `GET /api/v1/rewards/leaderboard` — Inter-hostel and individual student leaderboard.
- `GET /api/v1/rewards/perks` — List campus partner perks and canteen offers.
- `POST /api/v1/rewards/perks/:id/redeem` — Redeem a perk using accumulated QP.

### Community & Forum (`/community`)
- `GET /api/v1/community/threads` — List campus discussion threads.
- `POST /api/v1/community/threads` — Post a new question or discussion topic.
- `POST /api/v1/community/threads/:id/replies` — Post a reply to a thread.
- `POST /api/v1/community/threads/:id/upvote` — Upvote a thread or answer.

---

## 📡 Socket.io Real-Time Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `quest:created` | Server ➔ Client | `{ quest }` | Broadcast to `quests:open` when a new quest is posted |
| `quest:claimed` | Server ➔ Client | `{ questId, courierId, courierName }` | Sent when a quester claims a task |
| `quest:status_changed` | Server ➔ Client | `{ questId, status, updatedAt }` | Sent to the per-quest room `quest:<id>` |
| `user:qp_updated` | Server ➔ Client | `{ userId, newBalance, delta, reason }` | Private update to `user:<id>` room |
| `join:quest` | Client ➔ Server | `{ questId }` | Subscribes client to real-time quest updates |
| `leave:quest` | Client ➔ Server | `{ questId }` | Unsubscribes client from quest updates |

---

## 🚀 Installation & Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (version 14+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install --global expo-cli` optional)
- [Expo Go App](https://expo.dev/go) on your iOS/Android device for real-time mobile testing

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to configure your PostgreSQL credentials and JWT secret.*

4. **Run Database Migrations & Seeds**:
   ```bash
   # Executes SQL migrations and seeds sample users, quests, and perks
   npm run migrate:seed
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   *The server will boot on `http://localhost:4000` (Health check: `http://localhost:4000/health`).*

---

### Frontend / Mobile App Setup

1. **Return to the project root directory**:
   ```bash
   cd ..
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo development server**:
   ```bash
   npm start
   ```

4. **Run on your preferred platform**:
   - **Web Browser**: Press <kbd>w</kbd> in the terminal or run `npm run web`.
   - **Android Emulator / Device**: Press <kbd>a</kbd> or scan the QR code via Expo Go.
   - **iOS Simulator / Device**: Press <kbd>i</kbd> or scan the QR code with your iPhone Camera.

---

## ⚙️ Configuration (.env)

The backend `.env` file supports the following parameters:

```env
# Server
NODE_ENV=development
PORT=4000

# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/quest_db
# Or individual parameters:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quest_db
DB_USER=postgres
DB_PASSWORD=password
DB_POOL_MIN=2
DB_POOL_MAX=10

# Authentication
JWT_SECRET=your_super_secret_jwt_key_at_least_64_characters_long
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Socket.io & CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8081,exp://localhost:19000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the repository files for details.
