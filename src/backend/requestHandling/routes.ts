import { pairUserAndRoute, routeAdd, routeGet } from "../db_opertions";
import { Request, Response } from 'express';
import { db } from '../httpDriver' 
import express from 'express';

const router = express.Router();

//Adds a route into the database 
router.post('/create', async (req:Request, res: Response) => {
  try {
    const {data} = req.body; 

    if(!data) {
      console.log("request parameters missing");
      res.status(400).json({error: "request parameters missing"});
      return; 
    }
    const routeId = await routeAdd(db, data);

    if (!routeId.data) {
      console.error("route id invalid");
      res.status(400).json({error: "route id invalid"});
      return;
    }

    console.log(req.body);
    console.log("id", routeId);
    const userId = Number(req.headers['UserId']);

    await pairUserAndRoute(db, userId, routeId?.data);

    res.status(201);
    res.json(routeId.data);

    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json();
    }
});

//Sends route information from backend to frontend 
router.get('/get', async(req: Request, res: Response) => {
  try {
    const {routeID} = req.query;  

    var parsedRouteId = Number(routeID);
     
    if(typeof parsedRouteId !== 'number' || isNaN(parsedRouteId)) {
      console.log("missing request parameters");
      res.status(400).json({error: "missing request parameters"})
      return;
    }

    const route = await routeGet(db, parsedRouteId);
    if (route.success && route.data) {
      res.json(route.data.data);
    }

  }
  catch(error){
    console.log(error);
    res.status(500);
    res.json();
  }
});

//add 
router.post(`/add`, async(req: Request, res: Response) => {
  try{
    const {userID, routeID} = req.body; 
    
    if(typeof userID !== 'number' || isNaN(userID) ||
       typeof routeID !== 'number' || isNaN(routeID) ) {
      console.log("No userID or routeID"); 
      res.status(500).json(); 
      return; 
    }

    const pairStatus = await pairUserAndRoute(db, userID, routeID); 
    if(!pairStatus.success){
      console.log("could not pair route and user"); 
      res.status(400).json()
      return; 
    }

    res.status(201).json(); 
  } catch (err) {
    console.log("Backend request error", err); 
    res.status(500).json();
  }
})

//remove 

export default router;
