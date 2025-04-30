import { WebSocketServer } from "ws";
import { DBInit, routeAdd, routeGet, clearGroups, clearRoutes,  clearUsers, groupAdd, groupCreate } from "./db_operations";

//Lägg till signal handler för graceful shutdown kanske? 

interface typeOfData{
  type: string, 
  data: JSON, 
  id: number, 
  message?: string
}

const port = 3000;
const wss = new WebSocketServer({ port });
console.log("Server is running on port 3000"); 

wss.on('connection', (ws) => {
  ws.send("Hello client");

  ws.on('message', async (recievedData) => {
    console.log(recievedData);
    try{
      const data: typeOfData = JSON.parse(recievedData.toString());
      console.log(data.type);
      const theTypeOfData = data.type; 

      try {
        const db = await DBInit();//eventuellt flytta till on connection??
        switch (theTypeOfData) {
          case 'Route data':
            const id = await routeAdd(db, JSON.stringify(data.data)); 

            if(id.data) {
              //const routeDistance = data.data.routes[0].summary.distance;
              console.log("The route id: ", id.data); 
              //groupCreate(db, id.data, );
            }

          case 'User data':
            //lägg in i users 

          case 'Group data':
            //lägg in i groups 

          case 'id request':
            //leta upp användare baserat på typ mail 

          case 'Other':
            console.log(JSON.stringify(data.data));

        }
        
  
  
        //OBS TAR BORT ALL FINO FRÅN DATABAS 
        await clearGroups(db); 
        await clearRoutes(db); 
        await clearUsers(db); 
  
      } catch (err){
        console.error("Something went wrong :(", err); 
      }
    } catch (err){
      console.error("Could not parse data", err); 
    }
    
    //parsa data 
    //eventuellt dela upp? / sätt att veta om det är en group??? 
    

  })
})
