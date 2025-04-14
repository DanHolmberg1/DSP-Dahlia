import { DBInit, getAllRoutes, pairUserAndRoute, routeAdd, routeGet } from "./db_opertions";
import { Request, Response } from 'express';

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000; 

app.use(express.json()); 

app.post('/routesAdd', async (req:Request, res: Response) => {
  try {
    const db = await DBInit(); //Placeholder 
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
  res.json();

  }
  catch (err) {
    console.log(err);
    res.status(500);
    res.json();
  }
});

app.listen(port, () => {
  console.log(`API is live at http://localhost:${port}`);
});

app.get('/routeGet', async(req: Request, res: Response) => {
  try {
    const {userID} = req.query;  
     
    if(!userID)
      return;

    var parseduserId = Number.parseInt(userID.toString());
    const db = await DBInit();
    const allRoutes = await getAllRoutes(db, parseduserId);

    res.json(allRoutes.data);

  }
  catch(error){
    console.log(error);
    res.status(500);
    res.json();
  }
});
 