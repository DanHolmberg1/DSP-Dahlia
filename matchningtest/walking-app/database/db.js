"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// database/DB.ts
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, 'walking_app.db');
exports.db = new better_sqlite3_1.default(DB_PATH);
// Optimeringar
exports.db.pragma("journal_mode = WAL");
exports.db.pragma("synchronous = NORMAL");
// Skapa användartabell med kön
exports.db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('man', 'kvinna', 'annat', 'vill_inte_säga')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
// Exempelanvändare (om databasen är tom)
const rowCount = exports.db.prepare("SELECT COUNT(*) as count FROM users").get().count;
if (rowCount === 0) {
    const insert = exports.db.prepare("INSERT INTO users (username, password, gender) VALUES (?, ?, ?)");
    insert.run('anna', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MH/rJ6HCx6YzYFX5Q6FyVd7T3dBhJdW', 'kvinna'); // Lösen: "anna123"
    insert.run('erik', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MH/rJ6HCx6YzYFX5Q6FyVd7T3dBhJdW', 'man'); // Lösen: "erik123"
}
process.on('exit', () => exports.db.close());
