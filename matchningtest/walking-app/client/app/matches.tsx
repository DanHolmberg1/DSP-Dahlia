import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface Match {
  id: number;
  username: string;
  age: number;
  gender: string;
  distance: number;
  is_online: boolean;
  interests: string[];
}

export default function MatchesScreen() {
  const { user, logout, updateOnlineStatus, fetchMatches } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = async () => {
    if (!user?.id) return;
    
    setRefreshing(true);
    setError(null);
    try {
      // Uppdatera online-status med hjälp av useAuth-hooken
      await updateOnlineStatus(user.id, true);

      // Hämta matchningar med hjälp av useAuth-hooken
      const matchesData = await fetchMatches(radius);
      setMatches(matchesData);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      setError(err instanceof Error ? err.message : 'Kunde inte hämta matchningar');
      
      // Om det är ett autentiseringsfel, logga ut användaren
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('authentication'))) {
        await logout();
        router.replace('/auth/login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Utloggning misslyckades');
    }
  };

  useEffect(() => {
    loadMatches();
    
    // Uppdatera matchningar var 15:e minut
    const interval = setInterval(loadMatches, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [radius, user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Försök igen" onPress={loadMatches} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.radiusText}>Sökradius: {radius} km</Text>
        <Slider
          minimumValue={1}
          maximumValue={50}
          step={1}
          value={radius}
          onValueChange={setRadius}
          style={styles.slider}
          minimumTrackTintColor="#6200ee"
          maximumTrackTintColor="#ccc"
        />
        
        <View style={styles.preferencesRow}>
          <Link href="/protected/preferences" asChild>
            <TouchableOpacity style={styles.preferencesButton}>
              <MaterialIcons name="settings" size={20} color="white" />
              <Text style={styles.preferencesText}>Inställningar</Text>
            </TouchableOpacity>
          </Link>
          
          <Button 
            title="Logga ut" 
            onPress={handleLogout} 
            color="#ff4444"
          />
        </View>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={loadMatches}
        renderItem={({ item }) => (
          <View style={[
            styles.matchCard,
            item.is_online ? styles.onlineCard : styles.offlineCard
          ]}>
            <View style={styles.matchHeader}>
              <Text style={styles.name}>
                {item.username}, {item.age}
              </Text>
              <View style={[
                styles.statusIndicator,
                item.is_online ? styles.online : styles.offline
              ]}>
                <Text style={styles.statusText}>
                  {item.is_online ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.gender}>
              {item.gender === 'man' ? 'Man' : 
               item.gender === 'kvinna' ? 'Kvinna' : 'Annat'}
            </Text>
            
            <Text style={styles.distance}>
              {item.distance < 1 
                ? `${Math.round(item.distance * 1000)} m bort` 
                : `${item.distance.toFixed(1)} km bort`}
            </Text>
            
            {item.interests?.length > 0 && (
              <View style={styles.interestsContainer}>
                <Text style={styles.interestsTitle}>Intressen:</Text>
                <View style={styles.interestsList}>
                  {item.interests.map((interest, index) => (
                    <Text key={index} style={styles.interestTag}>{interest}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noMatches}>Inga matchningar hittades. Justera sökradien eller dina preferenser.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  radiusText: {
    marginBottom: 10,
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
  preferencesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  preferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  preferencesText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  matchCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 1,
  },
  onlineCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  offlineCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#9E9E9E',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gender: {
    color: '#666',
    marginBottom: 4,
  },
  distance: {
    color: '#616161',
    marginBottom: 8,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  online: {
    backgroundColor: '#E8F5E9',
  },
  offline: {
    backgroundColor: '#EEEEEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  interestsContainer: {
    marginTop: 8,
  },
  interestsTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 12,
  },
  noMatches: {
    textAlign: 'center',
    marginTop: 20,
    color: '#757575',
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
});