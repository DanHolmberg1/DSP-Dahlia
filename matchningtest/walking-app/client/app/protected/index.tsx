// app/(protected)/index.tsx
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProtectedScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
        Min Profil
      </Text>

      <View style={styles.profileInfo}>
        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
          Namn: {user?.username}
        </Text>
        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
          Ålder: {user?.age}
        </Text>
        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
          Kön: {user?.gender === 'man' ? 'Man' : user?.gender === 'kvinna' ? 'Kvinna' : 'Annat'}
        </Text>
      </View>

      <View style={styles.buttonGroup}>
        <Button
          title="Inställningar"
          onPress={() => router.push({ pathname: '/protected/preferences' })}
          color={colorScheme === 'dark' ? '#bb86fc' : '#6200ee'}
        />
        <Button
          title="Logga ut"
          onPress={logout}
          color="#ff4444"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  profileInfo: {
    marginBottom: 30,
    gap: 10,
  },
  buttonGroup: {
    gap: 15,
  },
});