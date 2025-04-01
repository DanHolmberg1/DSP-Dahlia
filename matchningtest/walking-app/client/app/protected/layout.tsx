import { Stack } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from 'react-native';

export default function ProtectedLayout() {
  const { logout } = useAuth();

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Min Profil',
          headerRight: () => (
            <Button onPress={logout} title="Logga ut" color="#ff4444" />
          )
        }} 
      />
      <Stack.Screen 
        name="preferences" 
        options={{ 
          title: 'Inställningar',
          presentation: 'modal'
        }} 
      />
    </Stack>
  );
}