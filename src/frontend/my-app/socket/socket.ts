import io from 'socket.io-client';

// Anpassa beroende på miljö (development/production)
const URL = process.env.NODE_ENV === 'production' 
  ? 'https://din-produktionsserver.com' 
  : 'http://localhost:3000';

export const socket = io(URL, {
  autoConnect: false, // Anslut manuellt istället
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Eventuella grundinställningar
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});