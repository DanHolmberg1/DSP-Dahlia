
//Placeholder?? 

import { Database } from "sqlite";
import { clearGroups, clearRoutes, clearUsers, DBInit } from "./db_opertions";
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
