
//Placeholder?? 

import { Database } from "sqlite";
import { clearGroups, clearRoutes, clearUsers, DBInit, createUser, routeAdd, groupCreate } from "./db_opertions";
import { Request, response } from "express";

const express = require('express');
const cors = require('cors');

export const app = express();
app.use(cors());
const port = 3000; 

app.use(express.json());  

export let db: Database;
(async () => {
  db = await DBInit();

  const name1 = "Anna"; 
  const email1 = "anna@email.com"; 
  const age1 = 35; 
  const sex1 = 1; 

  const route1 = JSON.parse('{"name":"TestWalk1, not real data"}');

  const descr1 = "Walking in group";
  const groupName1 = "Walk"; 
  const nrOfSpots1 = 10
  const date1 = new Date(); 

  const userID = await createUser(db, name1, email1, age1, sex1);
  const routeID = await routeAdd(db, route1);
  
  const groupID = await groupCreate(db, userID.data!, routeID.data!, descr1, groupName1, nrOfSpots1, date1);
  console.log("Prep done!"); 
})();

app.listen(port, () => {
    console.log(`API is live at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
    console.log('Closing down');
    await clearUsers(db); 
    await clearGroups(db); 
    await clearRoutes(db); 
    await db.close(); 
    //Skicka något till alla clients? 
    process.exit(); 
});

const routesRequests = require('./requestHandling/routes');
app.use('/routes', routesRequests);  

const groupsRequests = require('./requestHandling/groups');
app.use('/groups', groupsRequests);  

const usersRequests = require('./requestHandling/users');
app.use('/users', usersRequests);  

const mockRequests = require('./requestHandling/mocks');
app.use('/mock', mockRequests);  
