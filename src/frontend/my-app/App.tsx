// src/frontend/my-app/App.tsx
import { useEffect } from 'react';
import { socketService } from './socket/socketService';
import AppNavigator from './app/app.navigator';

export default function App() {
  useEffect(() => {
    // Anslut till socket när appen startar
    socketService.connect();

    return () => {
      // Stäng anslutning när appen avmonteras (valfritt)
      socketService.disconnect();
    };
  }, []);

  return <AppNavigator />;
}