import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

interface User {
  id: number;
  username: string;
  gender: string;
}

export default function FilteredUsersScreen() {
  const params = useLocalSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      try {
        const genderFilters = [];
        if (params.showMen === '1') genderFilters.push('man');
        if (params.showWomen === '1') genderFilters.push('kvinna');
        if (params.showOther === '1') genderFilters.push('annat');

        if (genderFilters.length === 0) {
          setUsers([]);
          return;
        }

        const response = await fetch(
          `http://192.168.0.118:3000/api/users/filter?gender=${genderFilters.join(',')}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ett okänt fel inträffade');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredUsers();
  }, [params]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
        {error ? 'Fel uppstod' : `Matchande användare (${users.length})`}
      </Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : users.length === 0 ? (
        <Text style={[styles.noResults, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Inga användare matchar dina val
        </Text>
      ) : (
        <FlatList
          data={users}
          renderItem={({ item }) => (
            <View style={[
              styles.userCard, 
              { backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
                {item.username} ({item.gender})
              </Text>
            </View>
          )}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userCard: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
  },
});