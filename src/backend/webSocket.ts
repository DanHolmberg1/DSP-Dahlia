import { WebSocketServer } from "ws";
import { DBInit, routeAdd, routeGet, clearGroups, clearRoutes,  clearUsers } from "./db_opertions";
import { Database } from 'sqlite';

interface typeOfData{
  type: string, 
  data: JSON
}

const port = 3000;
const wss = new WebSocketServer({ port });
console.log("Server is running on port 3000"); 

wss.on('connection', (ws) => {
  ws.send("Hello client");
  ws.on('message', async (recievedData) => {
    console.log(recievedData);
    const data: typeOfData = JSON.parse(recievedData.toString());
    console.log(data.type);
    

    try {
      const db = await DBInit();
      const id = await routeAdd(db, JSON.stringify(data.data)); 
      console.log("The route id: ", id.data); 
      console.log("The route data", (await routeGet(db, id.data!)).data); 


      //OBS TAR BORT ALL FINO FRÅN DATABAS 
      await clearGroups(db); 
      await clearRoutes(db); 
      await clearUsers(db); 

    } catch (err){
      console.error("Something went wrong :(", err); 
    }
    //parsa data 
    //eventuellt dela upp? / sätt att veta om det är en group??? 
    

  })
})
