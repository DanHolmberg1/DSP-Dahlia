import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, 'walking_app.db');
export const db = new Database(DB_PATH, { verbose: console.log });

db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

// Skapa tabeller
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT CHECK(gender IN ('man', 'kvinna', 'annat')) NOT NULL,
    is_online INTEGER DEFAULT 0, -- Nytt fält för online-status
    last_online TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_locations (
    user_id INTEGER PRIMARY KEY,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS interests (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_interest_map (
    user_id INTEGER,
    interest_id INTEGER,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY,
  show_men INTEGER DEFAULT 1,
  show_women INTEGER DEFAULT 1,
  show_other INTEGER DEFAULT 1,
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 99,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// Lägg till standardintressen OM de inte finns
const hasInterests = (db.prepare("SELECT COUNT(*) as count FROM interests").get() as { count: number }).count > 0;
if (!hasInterests) {
  const defaultInterests = [
    'Musik', 'Spel', 'Film', 'Sport', 'Matlagning',
    'Resor', 'Konst', 'Djur', 'Teknik', 'Läsning'
  ];
  
  const insert = db.prepare("INSERT INTO interests (name) VALUES (?)");
  defaultInterests.forEach(interest => insert.run(interest));
}

// Skapa 4 testanvändare OM de inte finns
const userCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }).count;
if (userCount === 0) {
  // Lägg till testanvändare
  const users = [
    { username: 'Anna', email: 'anna@test.com', password: 'anna123', age: 28, gender: 'kvinna' },
    { username: 'Erik', email: 'erik@test.com', password: 'erik123', age: 32, gender: 'man' },
    { username: 'Sara', email: 'sara@test.com', password: 'sara123', age: 24, gender: 'kvinna' },
    { username: 'Alex', email: 'alex@test.com', password: 'alex123', age: 30, gender: 'annat' }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, age, gender, is_online)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertLocation = db.prepare(`
    INSERT INTO user_locations (user_id, latitude, longitude)
    VALUES (?, ?, ?)
  `);

  const insertInterest = db.prepare(`
    INSERT INTO user_interest_map (user_id, interest_id)
    VALUES (?, ?)
  `);

  const insertPrefs = db.prepare(`
    INSERT INTO user_preferences (user_id, show_men, show_women, show_other, min_age, max_age)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Använd transaktion för att säkerställa dataintegritet
  db.exec('BEGIN TRANSACTION');
  try {
    users.forEach(user => {
      // Infoga användare
      const result = insertUser.run(
        user.username, 
        user.email, 
        user.password, 
        user.age, 
        user.gender,
        0 // Standardvärde för is_online
      );
      
      // Konvertera lastInsertRowid till Number
      const userId = Number(result.lastInsertRowid);

      // Infoga position
      insertLocation.run(
        userId,
        59.3293 + (Math.random() * 0.1 - 0.05),
        18.0686 + (Math.random() * 0.1 - 0.05)
      );

      // Infoga 2-4 slumpmässiga intressen
      const interestCount = Math.floor(Math.random() * 3) + 2;
      const usedInterests = new Set();
      while (usedInterests.size < interestCount) {
        const interestId = Math.floor(Math.random() * 10) + 1;
        if (!usedInterests.has(interestId)) {
          insertInterest.run(userId, interestId);
          usedInterests.add(interestId);
        }
      }

      // Infoga preferenser
      insertPrefs.run(
        userId,
        Math.random() > 0.3 ? 1 : 0,
        Math.random() > 0.3 ? 1 : 0,
        Math.random() > 0.5 ? 1 : 0,
        18 + Math.floor(Math.random() * 10),
        30 + Math.floor(Math.random() * 20)
      );
    });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Error initializing test data:', err);
    throw err;
  }
}

process.on('exit', () => db.close());