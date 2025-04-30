import { groupGetAllDate, groupCreate } from "../db_operations";
import { Request, Response } from 'express';
import { db } from '../httpDriver' 
import { Router } from 'express';

const router = Router();

// Get all groups based on date 
router.get('/byDate', async (req: Request, res: Response) => {
  try {
    const { date } = req.query; 

    if (!date) {
      console.log("No date :("); 
      return; 
    }

    var parsedDate = new Date(date?.toString()); 
    const allGroups = await groupGetAllDate(db, parsedDate); 

    if (!allGroups.success) {
      console.log("Failed to fetch :("); 
      return; 
    }

    res.json(allGroups.data); 
    console.log("done!!"); 

  } catch (err) {
    console.error("Request error backend: " + err); 
    res.status(500);
    res.json();
  }
});

// Creates a group, returns a group id to frontend 
router.post(`/create`, async (req: Request, res: Response) => {
  try {
    const { userID, routeID, name, description, availableSpots, date } = req.body;
    const parsedDate = new Date(date);
    const groupID = await groupCreate(db, userID, routeID, description, name, availableSpots, parsedDate);

    if (!groupID.success) {
      console.log("Failed to create group"); 
      return; 
    }

    res.status(201);
    res.json(groupID.data);

  } catch (err) {
    console.error("Request error backend: " + err); 
    res.status(500);
    res.json();
  }
});

// Export the router
export default router;
