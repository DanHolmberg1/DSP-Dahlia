
//Placeholder?? 
import cors from 'cors'; 
import { Database } from "sqlite";
import { DBInit } from "./db_opertions";
import express from 'express';

import routesRequests from './requestHandling/routes';
import groupsRequests from './requestHandling/groups';
import usersRequests from './requestHandling/users';
import mockRequests from './requestHandling/mocks';
import chatRequests from './requestHandling/chat';

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
    //await clearUsers(db); 
    //await clearGroups(db); 
    //await clearRoutes(db); 
    await db.close(); 
    //Skicka något till alla clients? 
    process.exit(); 
});
 
app.use('/routes', routesRequests);  
app.use('/groups', groupsRequests);  
app.use('/users', usersRequests);  
app.use('/mock', mockRequests); 
app.use('/chat', chatRequests);
