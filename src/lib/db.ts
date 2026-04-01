import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the database file is in a persistent location
const dbPath = path.resolve(process.cwd(), 'database.sqlite');
let db: any;
try {
  console.log(`Initializing database at: ${dbPath}`);
  db = new Database(dbPath);
} catch (err) {
  console.error("Failed to initialize database:", err);
  process.exit(1);
}

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    api_key TEXT UNIQUE,
    github_token TEXT,
    custom_rules TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    fileName TEXT NOT NULL,
    codeSnippet TEXT NOT NULL,
    result TEXT NOT NULL, -- JSON string
    profile TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

// Migration: Add api_key column if it doesn't exist
const tableInfo = db.prepare("PRAGMA table_info(users)").all();
const hasApiKey = tableInfo.some((col: any) => col.name === 'api_key');
if (!hasApiKey) {
  db.exec("ALTER TABLE users ADD COLUMN api_key TEXT UNIQUE");
}

const hasGithubToken = tableInfo.some((col: any) => col.name === 'github_token');
if (!hasGithubToken) {
  db.exec("ALTER TABLE users ADD COLUMN github_token TEXT");
}

const hasCustomRules = tableInfo.some((col: any) => col.name === 'custom_rules');
if (!hasCustomRules) {
  db.exec("ALTER TABLE users ADD COLUMN custom_rules TEXT");
}

export default db;
