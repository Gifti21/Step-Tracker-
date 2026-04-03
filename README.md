# StepTracker

A mobile-first step tracking web app built with Next.js 16, Prisma, and NextAuth.

![StepTracker](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)

## Features

- Step counting via device accelerometer (mobile) or tap-to-count (desktop)
- Real-time distance and calorie calculation
- Daily goal progress with animated ring
- 7-day activity history with bar chart
- User authentication (email/password)
- Profile settings — name, weight, stride length, daily goal
- Dark / light mode toggle

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Database** — SQLite via Prisma 7 + better-sqlite3
- **Auth** — NextAuth v5 (credentials)
- **UI** — Tailwind CSS v4, shadcn/ui, Radix UI, Lucide icons
- **Theme** — next-themes

## Getting Started

```bash
# 1. Clone and install
git clone https://github.com/your-username/step-tracker.git
cd step-tracker
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and set AUTH_SECRET (run: openssl rand -base64 32)

# 3. Generate Prisma client and create database
npx prisma generate
node -e "
const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');
db.exec(\`
  CREATE TABLE IF NOT EXISTS User (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE NOT NULL, password TEXT, image TEXT, weight REAL DEFAULT 70, strideLength REAL DEFAULT 0.78, dailyGoal INTEGER DEFAULT 10000, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS Account (id TEXT PRIMARY KEY, userId TEXT NOT NULL, type TEXT NOT NULL, provider TEXT NOT NULL, providerAccountId TEXT NOT NULL, refresh_token TEXT, access_token TEXT, expires_at INTEGER, token_type TEXT, scope TEXT, id_token TEXT, session_state TEXT, FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE, UNIQUE(provider, providerAccountId));
  CREATE TABLE IF NOT EXISTS StepSession (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, steps INTEGER DEFAULT 0, distance REAL DEFAULT 0, calories REAL DEFAULT 0, goal INTEGER DEFAULT 10000, userId TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE, UNIQUE(userId, date));
\`);
db.close();
"

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and start tracking.

## Deployment

For production, set these environment variables on your host:

```
AUTH_SECRET=<random-secret>
NEXTAUTH_URL=https://your-domain.com
DB_PATH=/data/dev.db
```

> SQLite works great for personal/small-team use. For high traffic, swap the adapter for PostgreSQL via `@prisma/adapter-pg`.

## License

MIT
