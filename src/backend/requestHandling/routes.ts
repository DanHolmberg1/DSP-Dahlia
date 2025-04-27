import { getAllRoutes, pairUserAndRoute, routeAdd } from "../db_opertions";
import { Request, Response } from 'express';
import { db } from '../httpDriver' 
import { Router } from 'express';

const router = Router();

//Adds a route into the database 
router.post('/create', async (req:Request, res: Response) => {
  try {
    const routeId = await routeAdd(db, req.body);
    if (!routeId.data) {
      console.error("route id invalid");
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
    const {userID} = req.query;  
     
    if(!userID) {
        return;
    }

    var parseduserId = Number.parseInt(userID.toString());
    const allRoutes = await getAllRoutes(db, parseduserId);

    res.json(allRoutes.data);

  }
  catch(error){
    console.log(error);
    res.status(500);
    res.json();
  }
});

//add 

//remove 

module.exports = router;
