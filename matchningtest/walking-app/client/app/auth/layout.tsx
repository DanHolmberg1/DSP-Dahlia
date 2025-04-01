//auth/layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Logga in' }} />
      <Stack.Screen name="register" options={{ title: 'Registrera' }} />
    </Stack>
  );
}