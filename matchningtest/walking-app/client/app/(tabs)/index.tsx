import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

interface User {
  id: number;
  username: string;
  gender: string;
  created_at: string;
}

export default function PublicScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://192.168.0.118:3000/api/users');
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        const data = await response.json();
        setUsers(data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err instanceof Error ? err.message : 'Kunde inte hämta användare');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFilterPress = () => {
    if (!user) {
      router.push({ pathname: '/auth/login' });
    } else {
      router.push({ pathname: '/protected' });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}>
      {/* Header med användarinfo och knappar */}
      <View style={styles.header}>
        {user ? (
          <>
            <Text style={[styles.userInfo, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Inloggad som: {user.username}
            </Text>
            <View style={styles.buttonGroup}>
              <Button 
                title="Filtrera" 
                onPress={handleFilterPress} 
                color={colorScheme === 'dark' ? '#bb86fc' : '#6200ee'}
              />
              <View style={{ width: 10 }} />
              <Button 
                title="Logga ut" 
                onPress={logout} 
                color="#ff4444"
              />
            </View>
          </>
        ) : (
          <View style={styles.authButtons}>
            <Link href="/auth/login" asChild>
              <Button 
                title="Logga in" 
                color={colorScheme === 'dark' ? '#bb86fc' : '#6200ee'} 
              />
            </Link>
            <View style={{ width: 10 }} />
            <Link href="../auth/register" asChild>
              <Button 
                title="Registrera" 
                color={colorScheme === 'dark' ? '#03dac6' : '#018786'} 
              />
            </Link>
          </View>
        )}
      </View>

      {/* Huvudinnehåll */}
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
        {user ? 'Alla användare' : 'Senast registrerade'} ({users.length})
      </Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={({ item }) => (
            <View style={[
              styles.userCard, 
              { 
                backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#fff',
                borderColor: colorScheme === 'dark' ? '#333' : '#ddd'
              }
            ]}>
              <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
                {item.username} ({item.gender})
              </Text>
              <Text style={[styles.timestamp, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
                Registrerad: {new Date(item.created_at).toLocaleDateString('sv-SE')}
              </Text>
            </View>
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
              Inga användare hittades
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  userCard: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});