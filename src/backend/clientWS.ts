import WebSocket from "ws";

const port = 3000;
const ws = new WebSocket(`ws://localhost:${port}`);

ws.on('open', () => {
  console.log('[Client] Connected');
  //ws.send('Hi, this is a client');
});
ws.on('message', (data) => {
  console.log(`Message from server: ${data}`);
  ws.send("Cool data");
})



