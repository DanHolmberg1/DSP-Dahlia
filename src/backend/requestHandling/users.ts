import { createUser, getUser } from "../db_operations";
import { Request, Response } from 'express';
import { db } from '../httpDriver' 
import { Router } from 'express';

const router = Router();

router.get('/testUserCreate', async(req: Request, res: Response) => {
  try {

    //const userID = await mockUser(db); 
    //if(userID) {
        //res.json(userID); 
    //}
    return; 
  } catch (err) {
    console.log(err);
    res.status(500);
    res.json();
  }
});

//Update 

//Remove 

//Get

module.exports = router;