import { Database } from "sqlite";
import { createUser, clearGroups, clearRoutes, clearUsers, clearUsersRoutes } from "../db_opertions";
import { Request, Response } from 'express';
import { db } from '../httpDriver' 
import { Router } from 'express';

const router = Router();

const name1 = "Anna"; 
const email1 = "ann@email.com"; 
const age1 = 35; 
const sex1 = 1; 

async function mockUser(db: Database): Promise<number|undefined> {
  const userID = await createUser(db, name1, email1, age1, sex1);
  return userID.data; 
}

async function mockUser2(db: Database): Promise<number|undefined> {
  const userID = await createUser(db, name1, "annaaaaaa@email.com", age1, sex1);
  return userID.data; 
}

async function clearDB(db: Database) {
    await clearUsers(db); 
    await clearGroups(db);
    await clearRoutes(db); 
    await clearUsersRoutes(db);
}

router.get('/userCreate', async(req: Request, res: Response) => {
  try {
    const userID = await mockUser(db); 
    if(userID) {
      res.json(userID); 
    }
    res.status(400).json(); 
  } catch (err) {
    console.log(err);
    res.status(500);
    res.json();
  }
});

router.get('/userCreate2', async(req: Request, res: Response) => {
  try {
    const userID = await mockUser2(db); 
    if(userID) {
      res.json(userID); 
    }
    res.status(400).json();  
  } catch (err) {
    console.log(err);
    res.status(500);
    res.json();
  }
});

router.get('/clear', async(req: Request, res: Response) => {
  try {
    await clearDB(db); 
    console.log("clear"); 
    res.json();

  } catch (error) {
    console.error("Failed to clear :<"); 
    res.status(500);
    res.json();
  }
})

module.exports = router;
