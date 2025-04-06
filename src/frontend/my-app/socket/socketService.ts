// frontend/my-app/socket/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io('http://192.168.0.118:3000', {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('welcome', (data: any) => {
      console.log('Server says:', data.message);
    });
  }

  sendTestMessage() {
    this.socket?.emit('clientData', {
      test: 'Hello from React Native!',
      time: new Date().toISOString(),
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const socketService = new SocketService();
