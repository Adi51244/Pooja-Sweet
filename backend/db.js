import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'snacks.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    snack_amount REAL DEFAULT 0,
    monthly_salary REAL DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    paid INTEGER DEFAULT 1,
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    UNIQUE(staff_id, date)
  );

  CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    pin_hash TEXT NOT NULL,
    admin_phone TEXT DEFAULT '',
    shop_name TEXT DEFAULT 'Pooja Sweets',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS advances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    month TEXT NOT NULL,
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS salary_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    salary_amount REAL NOT NULL,
    advances_total REAL DEFAULT 0,
    net_amount REAL NOT NULL,
    paid INTEGER DEFAULT 0,
    paid_date TEXT,
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    UNIQUE(staff_id, month)
  );
`);

// Migrations for existing databases
const staffCols = db.prepare('PRAGMA table_info(staff)').all().map((c) => c.name);
if (!staffCols.includes('monthly_salary')) {
  db.exec('ALTER TABLE staff ADD COLUMN monthly_salary REAL DEFAULT 0');
}

const admin = db.prepare('SELECT * FROM admin_settings WHERE id = 1').get();
if (!admin) {
  const defaultPin = process.env.ADMIN_PIN || '1234';
  const pinHash = bcrypt.hashSync(defaultPin, 10);
  db.prepare(
    'INSERT INTO admin_settings (id, pin_hash, shop_name) VALUES (1, ?, ?)'
  ).run(pinHash, 'Pooja Sweets');
  console.log('Admin created. Default PIN: ' + defaultPin + ' (change after login)');
}

export default db;
