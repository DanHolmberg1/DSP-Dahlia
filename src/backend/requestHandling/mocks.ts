// requestHandling/mock.ts
import { Database } from "sqlite";
import { createUser, clearGroups, clearRoutes, clearUsers, clearUsersRoutes } from "../db_operations";
import { Request, Response, Router } from 'express';
import { db } from '../httpDriver';

const router = Router();

const name1 = "Anna";
const email1 = "ann@email.com";
const age1 = 35;
const sex1 = 1;

async function mockUser(db: Database): Promise<number | undefined> {
  const userID = await createUser(db, name1, email1, age1, sex1);
  return userID.data;
}

async function clearDB(db: Database) {
  await clearUsers(db);
  await clearGroups(db);
  await clearRoutes(db);
  await clearUsersRoutes(db);
}

router.get('/userCreate', async (_req: Request, res: Response): Promise<any> => {
  try {
    const userID = await mockUser(db);
    if (userID) {
      return res.json(userID);
    } else {
      return res.status(500).json({ error: 'Failed to create user' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

router.get('/clear', async (_req: Request, res: Response):Promise <any> => {
  try {
    await clearDB(db);
    return res.status(200).json({ message: 'Database cleared' });
  } catch (error) {
    console.error("Failed to clear :<");
    return res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
