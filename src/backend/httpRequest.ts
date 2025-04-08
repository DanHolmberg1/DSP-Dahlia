import { DBInit, routeAdd, routeGet } from "./db_opertions";
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
    const result = await routeAdd(db, JSON.stringify(req.body)); 
    console.log(req.body);
    res.status(201);
    res.json();
    console.log("id", result);

//check if route is in db
      if(result.data) {
        const valid = await routeGet(db, result.data);
        console.log("route is valid ", valid);
      }
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


//Under construction:

// app.get('/routeGet', async( req: Request, res: Response) => {
//   try {
//     const {userID} = req.query;  
     
//     if(!userID)
//       return;

//     var parseduserId = Number.parseInt(userID.toString());
//     const db = await DBInit();
//     const response = await routeGet(db, parseduserId);
//     res.json(response.data);
//   }
//   catch(error){
//     console.log(error);
//     res.status(500);
//     res.json();
//   }

// })
 