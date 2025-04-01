import { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { User, ServerPreferences } from '@/types/types';

interface Interest {
  id: number;
  name: string;
}

export default function PreferencesScreen() {
  const { user, updatePreferences } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  const [preferences, setPreferences] = useState({
    showMen: user?.show_men ?? true,
    showWomen: user?.show_women ?? true,
    showOther: user?.show_other ?? true,
    minAge: user?.min_age ?? 18,
    maxAge: user?.max_age ?? 99,
  });
  
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>(user?.interests || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await fetch('http://192.168.0.118:3000/api/interests');
        const data = await response.json();
        setAvailableInterests(data);
      } catch (err) {
        console.error('Failed to fetch interests:', err);
      }
    };

    fetchInterests();
  }, []);

  const toggleInterest = (interestId: number) => {
    setSelectedInterests(prevInterests => {
      if (prevInterests.includes(interestId)) {
        // Ta bort intresset om det redan finns
        return prevInterests.filter(id => id !== interestId);
      } else {
        // Lägg till intresset om det inte finns
        return [...prevInterests, interestId];
      }
    });
  };

// PreferencesScreen.tsx
const handleSave = async () => {
  setLoading(true);
  try {
    const serverPrefs = {
      show_men: preferences.showMen ? 1 : 0,
      show_women: preferences.showWomen ? 1 : 0,
      show_other: preferences.showOther ? 1 : 0,
      min_age: preferences.minAge,
      max_age: preferences.maxAge,
      interests: selectedInterests
    };

    // Vänta på att uppdateringen slutförs
    await updatePreferences(serverPrefs);
    
    // Ladda om användardata
    if (user?.id) {
      const response = await fetch(`http://192.168.0.118:3000/api/users/${user.id}/preferences`);
      const latestPrefs = await response.json();
      setSelectedInterests(latestPrefs.interests || []);
    }
    
    router.back();
  } catch (error) {
    console.error('Save failed:', error);
    Alert.alert('Error', 'Failed to save preferences');
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
        Inställningar
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Visa användare med kön:
        </Text>
        
        <View style={styles.preferenceItem}>
          <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Män</Text>
          <Switch
            value={preferences.showMen}
            onValueChange={(value) => setPreferences({...preferences, showMen: value})}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.showMen ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Kvinnor</Text>
          <Switch
            value={preferences.showWomen}
            onValueChange={(value) => setPreferences({...preferences, showWomen: value})}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.showWomen ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Annat kön</Text>
          <Switch
            value={preferences.showOther}
            onValueChange={(value) => setPreferences({...preferences, showOther: value})}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.showOther ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Mina intressen
        </Text>
        <View style={styles.interestsContainer}>
          {availableInterests.map(interest => (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestButton,
                { backgroundColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' },
                selectedInterests.includes(interest.id) && styles.selectedInterest
              ]}
              onPress={() => toggleInterest(interest.id)}
            >
              <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
                {interest.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button 
        title="Spara inställningar" 
        onPress={handleSave}
        color={colorScheme === 'dark' ? '#bb86fc' : '#6200ee'}
      />
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
  section: {
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  interestButton: {
    padding: 10,
    margin: 5,
    borderRadius: 20,
  },
  selectedInterest: {
    backgroundColor: '#bb86fc',
  },
});