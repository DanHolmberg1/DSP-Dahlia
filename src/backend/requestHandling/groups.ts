import { groupGetAllDate, groupCreate, groupAdd, groupGetAllUsers, groupGetAllGroups, groupRemoveUser, isInGroup } from "../db_opertions";
import { Request, Response } from 'express';
import { db } from '../httpDriver' 
import express from 'express';

const router = express.Router();

//Get all groups based on date 
router.get('/byDate', async(req: Request, res: Response) => {
  try {
        
    const {date} = req.query; 

    if(typeof date !== 'string' || isNaN(Date.parse(date))) {
      console.log("Missing query parameters"); 
      res.status(400).json({ error: "Missing date query parameter" });
      return; 
    }

    var parsedDate = new Date(date?.toString()); 
    const allGroups = await groupGetAllDate(db, parsedDate); 

    if(!allGroups.success) {
      console.log("Failed to fetch"); 
      res.status(500).json({ error: "Failed to fetch groups" });
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

//Creates a group, returns a group id to frontend 
router.post(`/create`, async(req: Request, res: Response) => {
  try {
    const { userID, routeID, name, description, availableSpots, date } = req.body;
    console.log("here!!!!!!"); 
    if (
      typeof userID !== 'number' || isNaN(userID) ||
      typeof routeID !== 'number' || isNaN(routeID) ||
      typeof availableSpots !== 'number' || isNaN(availableSpots) ||
      typeof name !== 'string' || name.trim() === '' ||
      typeof description !== 'string' || description.trim() === '' ||
      typeof date !== 'string' || isNaN(Date.parse(date))
    ) {
      console.log("Missing query params"); 
      res.status(400).json({ error: "Missing query parameter" });
      return; 
    }

    const parsedDate = new Date(date);
    const groupID = await groupCreate(db, userID, routeID, description, name, availableSpots, parsedDate);

    if(!groupID.success) {
      console.log("Failed to create group"); 
      res.status(500).json({ error: "Failed to create group" });
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

//add 
router.post(`/add`, async(req: Request, res: Response) => {
  try {
    const { userID, groupID } = req.body;

    if(typeof userID !== 'number' || isNaN(userID) ||
       typeof groupID !== 'number' || isNaN(groupID) ) {
      console.log("Missing query params"); 
      res.status(400).json({ error: "Missing query parameter" });
      return; 
    }

    const status = await groupAdd(db, userID, groupID); 

    if(!status.success) {
      console.log("Failed to add to group"); 
      res.status(500).json();
      return; 
    }
    
    console.log("Added user: ", userID, "in group:", groupID); 
    res.status(201).json({ groupID: groupID });

  } catch (err) {
    console.error("Request error backend: " + err); 
    res.status(500);
    res.json();
  }
});

//byUser 
router.get('/byUser', async(req: Request, res: Response) => {
  try {
        
    const {userID} = req.query; 

    const useridParsed = Number(userID); 

    if(typeof useridParsed !== 'number' || isNaN(useridParsed)) {
      console.log("Missing query parameters"); 
      res.status(400).json({ error: "Missing userID query parameter" });
      return; 
    }

    const allGroups = await groupGetAllGroups(db, useridParsed); 

    if(!allGroups.success) {
      console.log("Failed to fetch :("); 
      res.status(500).json({ error: "Failed to fetch groups" });
      return; 
    }

    res.json(allGroups.data);  

  } catch (err) {
    console.error("Request error backend: " + err); 
    res.status(500);
    res.json();
  }
});

//byGroup 
router.get(`/byGroup`, async(req: Request, res: Response) => {
  try {
    const {groupID} = req.query; 

    if(typeof groupID !== 'number' || isNaN(groupID)) {
      console.log("no groupID"); 
      res.status(400).json({error: "missing query parameters"}); 
    } 

    const groupIDParsed = Number(groupID);
    const allUsers = await groupGetAllUsers(db, groupIDParsed);

    if(!allUsers.success) {
      console.log(allUsers);
      console.log("Failed to fetch :("); 
      res.status(500).json({ error: "Failed to fetch all users" });
      return; 
    }

    res.json(allUsers.data); 
  } catch (err) {
    console.error("Request error backend:", err); 
    res.status(500).json({ error: "request error "}); 
  }
})

//remove 
router.post(`/removeUser`, async(req: Request, res: Response) => {
  try{
    const {userID, groupID} = req.body; 

    if(typeof userID !== 'number' || isNaN(userID) ||
       typeof groupID !== 'number' || isNaN(groupID) ) {
      console.log("Missing query parameters"); 
      res.status(400).json({ error: "Missing query parameter" });
      return; 
    }
    const removeStatus = await groupRemoveUser(db, userID, groupID);
    
    if(!removeStatus.success) {
      console.log("Could not delete user", removeStatus.error);
      res.status(400).json({error: "Could not delete user"}); 
      return; 
    }

    console.log("Removed user: ", userID, "from group:", groupID); 

    res.status(201).json(); //behövs .json()??
  } catch (err) {
    console.log("Request error backend:", err);
    res.status(500).json({ error: "request error" }); 
  }
})

router.get('/isInGroup', async(req: Request, res: Response) => {
  try {
        
    const {userID, groupID} = req.query; 

    const useridParsed = Number(userID); 
    const groupidParsed = Number(groupID); 

    if(typeof useridParsed !== 'number' || isNaN(useridParsed) ||
       typeof groupidParsed !== 'number' || isNaN(groupidParsed) ) {
      console.log("Missing query parameters"); 
      console.log("The user id: ", userID); 
      console.log("The group id: ", groupID); 
      res.status(400).json({ error: "Missing userID, groupID query parameter" });
      return; 
    }

    const status = await isInGroup(db, useridParsed, groupidParsed); 

    res.json(status.success);  

  } catch (err) {
    console.error("Request error backend: " + err); 
    res.status(500);
    res.json();
  }
});

export default router;
