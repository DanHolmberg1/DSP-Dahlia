import { createUser, getUser, getUserEmail } from "../db_opertions";
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

    console.log(await getUserEmail(db, email));
    console.log(userID);  

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

//GetiD
  router.get('/getId', async(req: Request, res: Response) => {
    try {
          
      const {email} = req.query; 
  
      if (typeof email !== 'string' || email.trim() === '' ) {
        console.log("Missing query params"); 
        res.status(400).json({ error: "Missing query parameter" });
        return; 
      }
      

      const user = await getUserEmail(db, email); 
  
      if(!user.success) {
        console.log("Failed to fetch user" + user.error); 
        res.status(500).json({ error: "Failed to fetch user" });
        return; 
      }
  
      res.json(user.data?.id); 
      console.log("done!!"); 
  
    } catch (err) {
      console.error("Request error backend: " + err); 
      res.status(500);
      res.json();
    }
  });

  //GetUserID
  router.get('/get', async(req: Request, res: Response) => {
    try {
          
      const {userID} = req.query; 
  
      if (typeof userID !== 'number' || isNaN(userID) ) {
        console.log("Missing query params"); 
        res.status(400).json({ error: "Missing query parameter" });
        return; 
      }
  
      const user = await getUser(db, userID); 
  
      if(!user.success) {
        console.log("Failed to fetch user"); 
        res.status(500).json({ error: "Failed to fetch user" });
        return; 
      }

      res.json(user.data); 
      console.log("done!!"); 
  
    } catch (err) {
      console.error("Request error backend: " + err); 
      res.status(500);
      res.json();
    }
  });


export default router;

