import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");
const path = require("path");
const { fileURLToPath } = require("url");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "prisma", "dev.db");

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  image TEXT,
  weight REAL DEFAULT 70,
  strideLength REAL DEFAULT 0.78,
  dailyGoal INTEGER DEFAULT 10000,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  UNIQUE(provider, providerAccountId)
);

CREATE TABLE IF NOT EXISTS StepSession (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  steps INTEGER DEFAULT 0,
  distance REAL DEFAULT 0,
  calories REAL DEFAULT 0,
  goal INTEGER DEFAULT 10000,
  userId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  UNIQUE(userId, date)
);
`);

console.log("Database tables created successfully!");
db.close();
