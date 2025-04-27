import express from 'express';
import cors from 'cors';
import { DBInit, createUser, createChat, addUserToChat, sendMessage } from './db_operations';
import chatRoutes from './chatRoutes';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, '../../db/test.db');

// Uppdatera seedTestData-funktionen:
async function seedTestData(db: any) {
  // 1. Skapa testanvändare
  const testUsers = [
    { 
      name: 'Anna', 
      email: 'anna@test.com', 
      age: 32, 
      gender: 1,
      pace: 'Medium',
      features: ['dog'],
      latitude: 59.3293,
      longitude: 18.0696,
      bio: 'Gillar långa promenader' 
    },
    { 
      name: 'Johan', 
      email: 'johan@test.com', 
      age: 28, 
      gender: 2,
      pace: 'High',
      features: [],
      latitude: 59.4326,
      longitude: 18.0649,
      bio: 'Älskar att springa'
    },
    { 
      name: 'Maria', 
      email: 'maria@test.com', 
      age: 45, 
      gender: 1,
      pace: 'Low',
      features: ['wheelchair'],
      latitude: 59.3275,
      longitude: 18.0774,
      bio: 'Behöver en rullstol för att gå'
    },
    { 
      name: 'Erik', 
      email: 'erik@test.com', 
      age: 35, 
      gender: 2,
      pace: 'Medium',
      features: ['dog'],
      latitude: 59.3300,
      longitude: 18.0700,
      bio: 'Älskar hundar och naturen'
    }
  ];

  const createdUsers = [];
  for (const user of testUsers) {
    const result = await createUser(db, user.name, user.email, user.age, user.gender, user.latitude, user.longitude, user.bio, user.pace, user.features);

    if (!result.success || !result.data) throw new Error(`Failed to create user ${user.name}`);
    createdUsers.push({ ...user, id: result.data });
  }

  // 2. Skapa vänrelationer (alla är vänner med alla i detta test)
  const [anna, johan, maria, erik] = createdUsers;
  const friendships = [
    [anna.id, johan.id],
    [anna.id, maria.id],
    [anna.id, erik.id],
    [johan.id, maria.id],
    [johan.id, erik.id],
    [maria.id, erik.id]
  ];

  for (const [user1, user2] of friendships) {
    await db.run(
      'INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?), (?, ?)',
      [user1, user2, user2, user1]
    );
  }

  console.log('Testdata initierad med:', {
    users: createdUsers.map(u => u.name),
    friendships
  });
}

async function startServer(port = 3000) {
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Tidigare databas raderad');
    }

    const db = await DBInit(dbPath);
    console.log('Databas initierad');

    // Lägg till testdata
    await seedTestData(db);

    app.use((req, res, next) => {
      (req as any).db = db;
      next();
    });

    app.use('/api', chatRoutes);

    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    const server = app.listen(port, () => {
      console.log(`Server igång på http://localhost:${port}`);
    });

    return server;
  } catch (err) {
    console.error('Kunde inte starta servern:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer()
    .then(() => console.log('Server startad med testdata'))
    .catch(err => console.error('Server start misslyckades:', err));
}

export { startServer };