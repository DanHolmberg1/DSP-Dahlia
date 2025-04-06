// frontend/my-app/components/TestSocketScreen.tsx
import React, { useEffect } from 'react';
import { Button, View, Text } from 'react-native';
import { socketService } from '@/socket/socketService';

export default function TestSocketScreen() {
  useEffect(() => {
    // Anslut när komponenten laddas
    socketService.connect();

    return () => {
      // Koppla från när komponenten stängs
      socketService.disconnect();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>WebSocket Test</Text>
      <Button
        title="Send Test Message"
        onPress={() => socketService.sendTestMessage()}
      />
    </View>
  );
}