import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Modal, Pressable, Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { chatAPI } from '@/http/chatAPI';
import { useTypedNavigation, useTypedRoute } from '@/hooks/useTypedNavigation';

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const mapPace = (pace: string) => {
  switch (pace?.toLowerCase()) {
    case 'low': return 'Långsam';
    case 'medium': return 'Medel';
    case 'high': return 'Snabb';
    default: return pace || 'Okänd';
  }
};

const mapGender = (gender: number) => {
  return gender === 1 ? 'Kvinna' : gender === 2 ? 'Man' : 'Annat';
};

const DiscoverPeopleScreen = () => {
  const navigation = useTypedNavigation();
  const { params: { currentUser } } = useTypedRoute<'Find Friends'>();

  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [expandedPerson, setExpandedPerson] = useState<number | null>(null);
  const [lowAge, setLowAge] = useState(18);
  const [highAge, setHighAge] = useState(80);
  const [maxDistance, setMaxDistance] = useState(10);
  const [selectedGender, setSelectedGender] = useState('Alla');
  const [filters, setFilters] = useState({
    dogFriendly: false,
    pace: { low: false, medium: false, high: false }
  });

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const users = await chatAPI.getUsers();
        
        // Säkerställ att users är en array och hantera felaktig data
        if (!Array.isArray(users)) {
          throw new Error('Ogiltigt dataformat från servern');
        }

        const filtered = users
          .filter(user => user?.id && user.id !== currentUser.id)
          .map(user => ({
            ...user,
            bio: user.bio || '',
            features: typeof user.features === 'string' ? 
              JSON.parse(user.features) : 
              Array.isArray(user.features) ? user.features : [],
            pace: user.pace || 'Okänd',
            gender: user.gender || 0,
            age: user.age || 0,
            latitude: user.latitude || 0,
            longitude: user.longitude || 0
          }));

        setPeople(filtered);
      } catch (err) {
        console.error('Kunde inte ladda personer:', err);
        Alert.alert('Fel', 'Kunde inte ladda användardata');
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, [currentUser.id]);

  const handleStartChat = async (person: any) => {
    try {
      const existingChat = await chatAPI.findChatBetweenUsers([currentUser.id, person.id]);
      let chat;
      if (existingChat) {
        chat = existingChat;
      } else {
        chat = await chatAPI.createChat(`${currentUser.name} & ${person.name}`, [currentUser.id, person.id]);
      }

      navigation.navigate('Messages', { 
        chatId: chat.id, 
        chatName: person.name, 
        currentUser 
      });
    } catch (err) {
      console.error('Error starting chat:', err);
      Alert.alert('Fel', 'Kunde inte starta chatt');
    }
  };

  const filteredPeople = people.filter(person => {
    if (!person?.latitude || !person?.longitude) return false;

    const distance = haversineDistance(
      currentUser.latitude, currentUser.longitude,
      person.latitude, person.longitude
    );
    person.distance = distance;

    if (person.age < lowAge || person.age > highAge) return false;
    if (distance > maxDistance) return false;
    
    if (selectedGender !== 'Alla') {
      const genderMap: Record<string, string> = {
        'Kvinna': '1',
        'Man': '2',
        'Annat': '3'
      };
      if (person.gender.toString() !== genderMap[selectedGender]) return false;
    }

    if (filters.dogFriendly && !person.features?.includes('dog')) return false;

    const paceFilters = Object.entries(filters.pace).filter(([_, value]) => value);
    if (paceFilters.length > 0) {
      const personPace = person.pace?.toLowerCase();
      const matchedPace = paceFilters.some(([key]) => {
        const paceMap: Record<string, string> = {
          low: 'low',
          medium: 'medium',
          high: 'high'
        };
        return personPace?.includes(paceMap[key]);
      });
      if (!matchedPace) return false;
    }

    return true;
  });

  const toggleFilter = (filterType: string, paceType?: string) => {
    if (paceType) {
      setFilters(prev => ({
        ...prev,
        pace: {
          ...prev.pace,
          [paceType]: !prev.pace[paceType as keyof typeof prev.pace]
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: !prev[filterType as keyof typeof prev]
      }));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E15F18" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Personer nära dig ({filteredPeople.length})
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <ScrollView style={styles.scrollContainer}>
        {filteredPeople.map((person) => (
          <View key={person.id} style={[
            styles.personCard,
            expandedPerson === person.id && styles.expandedCard
          ]}>
            <View style={styles.personHeader}>
              <TouchableOpacity onPress={() => setSelectedPerson(person)}>
                <Image 
                  source={{ uri: person.avatar }} 
                  style={styles.avatar} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.personInfo}
                onPress={() => setExpandedPerson(expandedPerson === person.id ? null : person.id)}
              >
                <Text style={styles.personName}>
                  {person.name}, {person.age} år
                </Text>
                <Text style={styles.personDistance}>
                  {person.distance?.toFixed(1)} km bort • {mapPace(person.pace)} hastighet
                </Text>
              </TouchableOpacity>
              <View style={styles.featuresContainer}>
                {person.features?.includes('dog') && (
                  <FontAwesome name="paw" size={16} color="#666" style={styles.featureIcon} />
                )}
                {person.features?.includes('wheelchair') && (
                  <MaterialIcons name="accessible" size={16} color="#666" style={styles.featureIcon} />
                )}
              </View>
            </View>

            {expandedPerson === person.id && (
              <View style={styles.expandedContent}>
                <Text style={styles.bioText}>{person.bio || 'Den här användaren har inte skrivit någon bio ännu'}</Text>
                
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={() => handleStartChat(person)}
                >
                  <Text style={styles.messageButtonText}>Skicka meddelande</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Filtermodal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.filterModalContainer}>
            <Pressable style={styles.filterModalContent}>
              <Text style={styles.filterModalTitle}>
                Filtrera personer
              </Text>

              {/* Åldersintervall */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>
                  Ålder: {lowAge} - {highAge} år
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={18}
                  maximumValue={highAge - 1}
                  step={1}
                  minimumTrackTintColor="#E15F18"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#E15F18"
                  value={lowAge}
                  onValueChange={(value) => setLowAge(Math.min(value, highAge - 1))}
                />
                <Slider
                  style={styles.slider}
                  minimumValue={lowAge + 1}
                  maximumValue={80}
                  step={1}
                  minimumTrackTintColor="#E15F18"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#E15F18"
                  value={highAge}
                  onValueChange={(value) => setHighAge(Math.max(value, lowAge + 1))}
                />
              </View>

              {/* Max avstånd */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>
                  Max avstånd: {maxDistance} km
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={50}
                  step={1}
                  minimumTrackTintColor="#E15F18"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#E15F18"
                  value={maxDistance}
                  onValueChange={(value) => setMaxDistance(value)}
                />
              </View>

              {/* Kön */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Kön:</Text>
                <View style={styles.genderButtonsContainer}>
                  {['Alla', 'Kvinna', 'Man', 'Annat'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderButton,
                        selectedGender === gender && styles.selectedGenderButton
                      ]}
                      onPress={() => setSelectedGender(gender)}
                    >
                      <Text style={[
                        styles.genderButtonText,
                        selectedGender === gender && styles.selectedGenderButtonText
                      ]}>
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Hundvänligt filter */}
              <View style={styles.filterSection}>
                <TouchableOpacity 
                  style={styles.filterItem}
                  onPress={() => toggleFilter('dogFriendly')}
                >
                  <View style={styles.filterTextContainer}>
                    <FontAwesome 
                      name="paw" 
                      size={20} 
                      color="#666" 
                      style={styles.filterIcon} 
                    />
                    <Text style={styles.filterText}>Hundvänlig</Text>
                  </View>
                  {filters.dogFriendly ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Hastighetsfilter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Gånghastighet:</Text>
                <TouchableOpacity 
                  style={styles.filterItem}
                  onPress={() => toggleFilter('pace', 'low')}
                >
                  <Text style={styles.filterText}>Långsam</Text>
                  {filters.pace.low ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.filterItem}
                  onPress={() => toggleFilter('pace', 'medium')}
                >
                  <Text style={styles.filterText}>Medel</Text>
                  {filters.pace.medium ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.filterItem}
                  onPress={() => toggleFilter('pace', 'high')}
                >
                  <Text style={styles.filterText}>Snabb</Text>
                  {filters.pace.high ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>
                  Visa resultat ({filteredPeople.length})
                </Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Profilmodal */}
      <Modal
        visible={!!selectedPerson}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPerson(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedPerson(null)}
        >
          <View style={styles.profileModalContainer}>
            <Pressable>
              <View style={styles.profileModalContent}>
                <Image 
                  source={{ uri: selectedPerson?.avatar }} 
                  style={styles.modalAvatar} 
                />
                <Text style={styles.modalName}>
                  {selectedPerson?.name}, {selectedPerson?.age} år
                </Text>
                <Text style={styles.modalDistance}>
                  {selectedPerson?.distance?.toFixed(1)} km bort • {mapPace(selectedPerson?.pace)} hastighet
                </Text>
                
                <View style={styles.bioContainer}>
                  <Text style={styles.bioTitle}>Om mig</Text>
                  <Text style={styles.bioText}>{selectedPerson?.bio || 'Ingen bio tillgänglig'}</Text>
                </View>
                
                <View style={styles.featuresContainer}>
                  {selectedPerson?.features?.includes('dog') && (
                    <View style={styles.featureTag}>
                      <FontAwesome name="paw" size={16} color="#666" />
                      <Text style={styles.featureText}>Hundvänlig</Text>
                    </View>
                  )}
                  {selectedPerson?.features?.includes('wheelchair') && (
                    <View style={styles.featureTag}>
                      <MaterialIcons name="accessible" size={16} color="#666" />
                      <Text style={styles.featureText}>Rullstolsanpassad</Text>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.modalMessageButton}
                  onPress={() => {
                    setSelectedPerson(null);
                    handleStartChat(selectedPerson);
                  }}
                >
                  <Text style={styles.modalMessageButtonText}>Skicka meddelande</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#E15F18',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  filterButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  personCard: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  expandedCard: {
    paddingBottom: 20,
  },
  personHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  personDistance: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  featuresContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  featureText: {
    marginLeft: 4,
    fontSize: 12,
  },
  featureIcon: {
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 16,
  },
  bioText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  messageButton: {
    backgroundColor: "#E15F18",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  messageButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterModalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  filterModalContent: {
    width: "100%",
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    color: "#333",
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  genderButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderButton: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedGenderButton: {
    backgroundColor: "#E15F18",
    borderColor: "#E15F18",
  },
  genderButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  selectedGenderButtonText: {
    color: "white",
  },
  filterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterIcon: {
    marginRight: 10,
  },
  filterText: {
    fontSize: 16,
    color: "#333",
  },
  applyButton: {
    backgroundColor: "#E15F18",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileModalContainer: {
    width: "80%",
    maxWidth: 400,
  },
  profileModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  modalName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  modalDistance: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  bioContainer: {
    width: "100%",
    marginBottom: 20,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  modalMessageButton: {
    backgroundColor: "#E15F18",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    width: '100%',
    marginTop: 16,
  },
  modalMessageButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default DiscoverPeopleScreen;