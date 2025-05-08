import { createUser, getUser } from "../db_opertions";
import { Request, Response } from 'express';
import { db } from '../httpDriver' 
import express from 'express';

const router = express.Router();

//create
router.post(`/create`, async(req: Request, res: Response) => {
  try {
    const { name, email, age, sex } = req.body;
    if (
      typeof sex !== 'number' || isNaN(sex) ||
      typeof age !== 'number' || isNaN(age) ||
      typeof name !== 'string' || name.trim() === '' ||
      typeof email !== 'string' || email.trim() === ''
    ) {
      console.log("Missing query params"); 
      res.status(400).json({ error: "Missing query parameter" });
      return; 
    }

    const userID = await createUser(db, name, email, age, sex);

    if(!userID.success) {
      console.log("Failed to create user"); 
      res.status(500).json({ error: "Failed to create user" });
      return; 
    }

    res.status(201);
    res.json(userID.data);

  } catch (err) {
    console.error("Request error backend: " + err); 
    res.status(500);
    res.json();
  }
});

//Update 

//Remove 

//Get
router.post(`/get`, async(req: Request, res: Response) => {
    try {
      const { userID } = req.body;
      if (
        typeof userID !== 'number' || isNaN(userID) 
      ) {
        console.log("Missing query params"); 
        res.status(400).json({ error: "Missing query parameter" });
        return; 
      }
  
      const userInfo = await getUser(db, userID);
  
      if(!userInfo.success) {
        console.log("Failed to fetch user"); 
        res.status(500).json({ error: "Failed to fetch user" });
        return; 
      }
  
      res.status(201);
      res.json(userInfo.data);
  
    } catch (err) {
      console.error("Request error backend: " + err); 
      res.status(500);
      res.json();
    }
  });

export default router;

