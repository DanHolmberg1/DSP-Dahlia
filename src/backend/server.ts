import express from 'express';
import { DBInit } from './db_operations';
import chatRoutes from './chatRoutes';
import path from 'path';
import fs from 'fs';

const app = express();
const dbPath = path.join(__dirname, '../../db/test.db');

// Skapa db-mapp om den inte finns
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Ta bort befintlig databas om den finns
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

export async function startServer(port = 3000) {
  const db = await DBInit(dbPath);

  // Lägg till testanvändare
  const testUsers = [
    { name: 'Alice', email: 'alice@example.com', age: 28, gender: 1 },
    { name: 'Bob', email: 'bob@example.com', age: 32, gender: 2 },
    { name: 'Charlie', email: 'charlie@example.com', age: 24, gender: 3 },
    { name: 'Diana', email: 'diana@example.com', age: 35, gender: 1 },
    { name: 'Eve', email: 'eve@example.com', age: 29, gender: 1 }
  ];

  for (const user of testUsers) {
    await db.run(
      'INSERT INTO users (name, email, age, gender) VALUES (?, ?, ?, ?)',
      [user.name, user.email, user.age, user.gender]
    );
  }

  // Skapa testchat och meddelanden
  const chatResult = await db.run('INSERT INTO chats (name) VALUES (?)', ['Testchat']);
  const chatId = chatResult.lastID;

  for (const user of await db.all('SELECT id FROM users')) {
    await db.run('INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)', [chatId, user.id]);
  }

  await db.run(
    'INSERT INTO messages (chat_id, user_id, content) VALUES (?, ?, ?)',
    [chatId, 1, 'Hej alla! Jag är ny här.']
  );
  await db.run(
    'INSERT INTO messages (chat_id, user_id, content) VALUES (?, ?, ?)',
    [chatId, 2, 'Välkommen Alice!']
  );

  // Middleware
  app.use((req, res, next) => {
    (req as any).db = db;
    next();
  });

  app.use(express.json());
  app.use('/api', chatRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString() 
    });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Database created at: ${dbPath}`);
    console.log('Test data created:');
    console.log('- 5 test users');
    console.log('- 1 test chat with 2 initial messages');
  });
}

startServer();