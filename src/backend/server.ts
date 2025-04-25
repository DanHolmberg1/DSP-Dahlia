// server.ts
import express from 'express';
import { DBInit } from './db_operations';
import chatRoutes from './chatRoutes';
import path from 'path';
import fs from 'fs';

const app = express();
const dbPath = path.join(__dirname, '../../db/test.db');

async function startServer(port = 3000) {
  try {
    // Rensa befintlig databas
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Tidigare databas raderad');
    }

    const db = await DBInit(dbPath);
    console.log('Databas initierad');

    app.use((req, res, next) => {
      (req as any).db = db;
      next();
    });

    app.use(express.json());
    app.use('/api', chatRoutes);

    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    const server = app.listen(port, () => {
      console.log(`Server igång på http://localhost:${port}`);
      console.log(`API tillgängligt på http://localhost:${port}/api`);
    });

    return server;
  } catch (err) {
    console.error('Kunde inte starta servern:', err);
    process.exit(1);
  }
}

// Starta servern endast om filen körs direkt
if (require.main === module) {
  startServer()
    .then(() => console.log('Server startad'))
    .catch(err => console.error('Server start misslyckades:', err));
}

export { startServer };