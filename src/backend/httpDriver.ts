// httpDriver.ts
import express from 'express';
import cors from 'cors';
import { Database } from 'sqlite';
import { clearGroups, clearRoutes, clearUsers, DBInit } from './db_operations';

import routesRequests from './requestHandling/routes';
import groupsRequests from './requestHandling/group';
import mockRequests from './requestHandling/mocks';
import chatRequests from './requestHandling/chat';
const testUsers = [
    { 
      name: 'Anna', 
      email: 'anna@test.com', 
      age: 32, 
      sex: 1,
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
      sex: 2,
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
      sex: 1,
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
      sex: 2,
      pace: 'Medium',
      features: ['dog'],
      latitude: 59.3300,
      longitude: 18.0700,
      bio: 'Älskar hundar och naturen'
    }
  ];
  
  // Funktion för att lägga in testanvändare
  async function insertTestUsers() {
    for (const user of testUsers) {
      const existing = await db.get(`SELECT * FROM users WHERE email = ?`, user.email);
      if (!existing) {
        await db.run(
          `INSERT INTO users (name, email, age, sex, pace, features, latitude, longitude, bio, avatar)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.name,
            user.email,
            user.age,
            user.sex,
            user.pace,
            JSON.stringify(user.features),
            user.latitude,
            user.longitude,
            user.bio,
            `https://i.pravatar.cc/150?u=${user.email}`  // Använd email som unik identifierare
          ]
        );
        console.log(`Skapade testanvändare: ${user.name}`);
      }
    }
  }

  
export const app = express();
app.use(cors());
app.use(express.json());

const port = 3000;
export let db: Database;

(async () => {
  db = await DBInit();
  await insertTestUsers();
})();

// Route mounting
app.use('/routes', routesRequests);
app.use('/groups', groupsRequests);
app.use('/mock', mockRequests);
app.use('/chat', chatRequests);

app.listen(port, () => {
  console.log(`API is live at http://localhost:${port}`);
});

// Clean shutdown
process.on('SIGINT', async () => {
  console.log('Closing down');
  await clearUsers(db);
  await clearGroups(db);
  await clearRoutes(db);
  await db.close();
  process.exit();
});
