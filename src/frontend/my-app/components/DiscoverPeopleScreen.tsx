import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { useTypedNavigation, useTypedRoute } from '../hooks/useTypedNavigation';
import { chatAPI } from '@/http/chatAPI';

interface Person {
  id: number;
  name: string;
  age: number;
  distance: number;
  bio: string;
  avatar: string;
  pace: string;
  features: string[];
}

const DiscoverPeopleScreen = () => {
  const navigation = useTypedNavigation();
  const { params: { currentUser } } = useTypedRoute<'Find Friends'>();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPerson, setExpandedPerson] = useState<number | null>(null);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        // I en riktig app skulle detta komma från API:et
        const mockPeople: Person[] = [
          {
            id: 1,
            name: 'Anna',
            age: 32,
            distance: 1.2,
            bio: 'Gillar långa promenader i naturen',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            pace: 'Medium',
            features: ['dog']
          },
          // ... andra testpersoner
        ];
        
        setPeople(mockPeople);
      } catch (err) {
        setError('Kunde inte ladda personer');
        console.error('Error fetching people:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, []);

  const handleStartChat = async (personId: number) => {
    try {
      const person = people.find(p => p.id === personId);
      if (!person) return;
      
      const chat = await chatAPI.createChat(
        `Privat chatt med ${person.name}`,
        [currentUser.id, personId]
      );
      
      navigation.navigate('Messages', {
        chatId: chat.id,
        chatName: chat.name,
        currentUser
      });
    } catch (err) {
      console.error('Error starting chat:', err);
      alert('Kunde inte starta chatt. Försök igen senare.');
    }
  };

  const toggleExpand = (personId: number) => {
    setExpandedPerson(expandedPerson === personId ? null : personId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryButtonText}>Försök igen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Personer nära dig</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {people.map((person) => (
          <View key={person.id} style={styles.personCard}>
            <View style={styles.personHeader}>
              <Image 
                source={{ uri: person.avatar }} 
                style={styles.avatar} 
              />
              <View style={styles.personInfo}>
                <Text style={styles.personName}>
                  {person.name}, {person.age} år
                </Text>
                <Text style={styles.personDistance}>
                  {person.distance} km bort • {person.pace} hastighet
                </Text>
                {person.features.includes('dog') && (
                  <Text style={styles.featureTag}>🐶 Hundvänlig</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => toggleExpand(person.id)}
            >
              <Text style={styles.expandButtonText}>
                {expandedPerson === person.id ? 'Visa mindre' : 'Visa mer'}
              </Text>
            </TouchableOpacity>

            {expandedPerson === person.id && (
              <View style={styles.expandedContent}>
                <Text style={styles.bioText}>{person.bio}</Text>
                
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => handleStartChat(person.id)}
                >
                  <Text style={styles.chatButtonText}>Starta chatt</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  personCard: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  personDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  featureTag: {
    marginTop: 4,
    fontSize: 14,
    color: '#007bff',
  },
  expandButton: {
    marginTop: 10,
    padding: 8,
    alignItems: 'center',
  },
  expandButtonText: {
    color: '#007bff',
    fontSize: 14,
  },
  expandedContent: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  chatButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DiscoverPeopleScreen;