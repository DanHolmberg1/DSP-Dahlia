import { groupGetAllDate, groupCreate, groupAdd, groupGetAllUsers, groupGetAllGroups, groupRemoveAllDate, groupRemoveUser, isInGroup } from "../db_opertions";
import { Request, Response } from 'express';
import { db } from '../httpDriver' 
import { Router } from 'express';

const router = Router();

//Get all groups based on date 
router.get('/byDate', async(req: Request, res: Response) => {
  try {
        
    const {date} = req.query; 

    if(!date) {
      console.log("No date :("); 
      res.status(400).json({ error: "Missing date query parameter" });
      return; 
    }

    var parsedDate = new Date(date?.toString()); 
    const allGroups = await groupGetAllDate(db, parsedDate); 

    if(!allGroups.success) {
      console.log("Failed to fetch :("); 
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
    const parsedDate = new Date(date);
    const groupID = await groupCreate(db, userID, routeID, description, name, availableSpots, parsedDate);

    if(!groupID.success) {
      console.log("Failed to create group"); 
      res.status(500).json({ error: "Failed to create group" });
      return; 
    }
    //console.log(req.body);
    //console.log("id", groupID.data);

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
    const status = await groupAdd(db, userID, groupID); 

    if(!status.success) {
      console.log("Failed to add to group"); 
      res.status(500); 
      res.json()
      return; 
    }
    //console.log(req.body);
    //console.log("id", groupID);
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
    console.log(userID)

    if(!userID) {
      console.log("No date :("); 
      res.status(400).json({ error: "Missing userID query parameter" });
      return; 
    }

    const userIDParesd = Number(userID);
    const allGroups = await groupGetAllGroups(db, userIDParesd); 

    if(!allGroups.success) {
      console.log(allGroups);
      console.log("Failed to fetch :("); 
      //Avbryt request?? 
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
    if(!groupID) {
      console.log("no groupID"); 
      res.status(400).json({error: "no groupID"}); 
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
    console.log(userID, groupID)

    if(!userID) {
      console.log("No date :("); 
      res.status(400).json({ error: "Missing userID, groupID query parameter" });
      return; 
    }

    const userIDParesd = Number(userID);
    const status = await isInGroup(db, Number(userID), Number(groupID)); 

    res.json(status.success);  

  } catch (err) {
    console.error("Request error backend: " + err); 
    res.status(500);
    res.json();
  }
});

module.exports = router;
