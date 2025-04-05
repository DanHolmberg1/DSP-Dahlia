//driver.ts
import { createServer } from 'http';
import { Server } from 'socket.io';
import './db_opertions.ts'
import { DBInit, routeGet } from './db_opertions.ts';
import { Database } from 'sqlite';

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Client connected');

  // Sending data to client
  socket.emit('welcome', { message: 'Hello from the backend via WebSocket!' });

  // Receiving data from client
  socket.on('clientData', (data) => {
    console.log('Data from client:', data);
  });
});

httpServer.listen(3000, () => {
  console.log('WebSocket server running on port 3000');
});


async function main() {
  let db: Database = await DBInit();
  const res = await routeGet(db, 100);
  console.log(res);
}


main()
