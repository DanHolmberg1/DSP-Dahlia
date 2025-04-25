// server.ts
import express from 'express';
import { DBInit } from './db_operations';
import chatRoutes from './chatRoutes';
import path from 'path';
import fs from 'fs';

const app = express();
const dbPath = path.join(__dirname, '../../db/test.db');

// Rensa befintlig databas
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

export async function startServer(port = 3000) {
  const db = await DBInit(dbPath);

  // Middleware för att göra db tillgänglig i alla routes
  app.use((req, res, next) => {
    (req as any).db = db;
    next();
  });

  app.use(express.json());
  app.use('/api', chatRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.listen(port, () => {
    console.log(`Testserver igång på http://localhost:${port}`);
    console.log(`Databas återställd: ${dbPath}`);
  });
}

startServer();
