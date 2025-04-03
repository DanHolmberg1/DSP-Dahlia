import { WebSocketServer } from "ws";

const port = 3000;
const wss = new WebSocketServer({ port });

wss.on('connection', (ws) => {
  ws.send("Hello client");
  ws.on('message', (data) => {
    console.log(data);
  })
})
