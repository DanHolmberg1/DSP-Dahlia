import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Modal, Pressable, Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { chatAPI } from './requests/chatAPI';
import { useTypedNavigation } from '@/hooks/useTypedNavigation';
import { useAuth } from '@/context/authContext';

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

const mapSex = (sex: number) => {
  return sex === 1 ? 'Kvinna' : sex === 2 ? 'Man' : 'Annat';
};

const WalkBuddyScreen = () => {
  const navigation = useTypedNavigation();
  const { currentUser } = useAuth();
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [expandedPerson, setExpandedPerson] = useState<number | null>(null);
  
  // Filter states
  const [lowAge, setLowAge] = useState(18);
  const [highAge, setHighAge] = useState(80);
  const [maxDistance, setMaxDistance] = useState(10);
  const [selectedSex, setSelectedSex] = useState('Alla');
  const [filters, setFilters] = useState({
    dogFriendly: false,
    pace: { low: false, medium: false, high: false }
  });

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const users = await chatAPI.getUsers();
        
        interface User {
            id: string | number;
            latitude?: number;
            longitude?: number;
            features?: string | string[];
            bio?: string;
            pace?: string;
            sex?: string | number;
            age?: number;
            avatar?: string;
        }

        interface ProcessedUser extends User {
            distance: number;
            bio: string;
            features: string[];
            pace: string;
            sex: number;
            age: number;
            avatar: string;
        }

        const processedUsers: ProcessedUser[] = users
            .filter((user: User) => user?.id && user.id.toString() !== currentUser?.id?.toString())
            .map((user: User): ProcessedUser => {
                const distance = haversineDistance(
                    currentUser?.latitude || 59.3293, 
                    currentUser?.longitude || 18.0686,
                    user.latitude || 59.3293,
                    user.longitude || 18.0686
                );

                // Parse features safely
                let features: string[] = [];
                try {
                    features = typeof user.features === 'string' 
                        ? JSON.parse(user.features.replace(/'/g, '"'))
                        : (Array.isArray(user.features) ? user.features : []);
                } catch (e) {
                    features = [];
                }

                return {
                    ...user,
                    distance,
                    bio: user.bio || 'Ingen bio tillgänglig',
                    features,
                    pace: (user.pace || 'medium').toLowerCase(),
                    sex: typeof user.sex === 'string' ? parseInt(user.sex) : user.sex || 0,
                    age: user.age || 30,
                    avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`
                };
            });

        setPeople(processedUsers);
      } catch (err) {
        Alert.alert('Fel', 'Kunde inte ladda användare');
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, [currentUser?.id]);

  const handleStartChat = async (buddy: any) => {
    try {
      if (!currentUser?.id || !buddy?.id) {
        throw new Error('Missing user IDs');
      }
  
      console.log('Creating chat between:', currentUser.id, 'and', buddy.id);
      
      const { chatId } = await chatAPI.createOrGetChat([currentUser.id, buddy.id]);
      console.log('Chat created/found with ID:', chatId);
      
      navigation.navigate('Chat', {
        chatId,
        otherUser: buddy,
        currentUser
      });
      
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert(
        'Kunde inte starta chatt',
        (error as any)?.response?.data?.error || (error as Error)?.message || 'Något gick fel'
      );
    }
  };

  const filteredPeople = people.filter(person => {
    // Basic filters
    const passesBasicFilters = (
      person.age >= lowAge &&
      person.age <= highAge &&
      person.distance <= maxDistance
    );

    if (!passesBasicFilters) return false;

    // Sex filter
    if (selectedSex !== 'Alla') {
      const sexMap: Record<string, number> = {
        'Kvinna': 1,
        'Man': 2,
        'Annat': 3
      };
      if (person.sex !== sexMap[selectedSex]) return false;
    }

    // Dog friendly filter
    if (filters.dogFriendly && !person.features?.includes('dog')) return false;

    // Pace filter
    const paceFilters = Object.entries(filters.pace)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    
    if (paceFilters.length > 0 && !paceFilters.includes(person.pace || '')) {
      return false;
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
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>
          ID: {currentUser?.id || '0'}
        </Text>
      </View>
      
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

    {/* People List */}
    <ScrollView style={styles.scrollContainer}>
      {filteredPeople.length > 0 ? (
        filteredPeople.map((person) => (
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
                onPress={() => setExpandedPerson(
                  expandedPerson === person.id ? null : person.id
                )}
              >
                <Text style={styles.personName}>
                  {person.name}, {person.age} år
                </Text>
                <Text style={styles.personDistance}>
                  {person.distance.toFixed(1)} km bort • {mapPace(person.pace)} hastighet • {mapSex(person.sex)}
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
                <Text style={styles.bioText}>{person.bio}</Text>
                
                <TouchableOpacity 
                  onPress={() => handleStartChat(person)}
                  style={styles.messageButton}
                >
                  <Text style={styles.messageButtonText}>Skicka meddelande</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Inga personer hittades med valda filter</Text>
          <Text style={styles.emptySubText}>Justera filtren eller försök igen senare</Text>
        </View>
      )}
    </ScrollView>

    {/* Filter Modal */}
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
            <Text style={styles.filterModalTitle}>Filtrera personer</Text>

            {/* Age Range */}
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

            {/* Max Distance */}
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

            {/* Sex */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Kön:</Text>
              <View style={styles.sexButtonsContainer}>
                {['Alla', 'Kvinna', 'Man', 'Annat'].map((sex) => (
                  <TouchableOpacity
                    key={sex}
                    style={[
                      styles.sexButton,
                      selectedSex === sex && styles.selectedSexButton
                    ]}
                    onPress={() => setSelectedSex(sex)}
                  >
                    <Text style={[
                      styles.sexButtonText,
                      selectedSex === sex && styles.selectedSexButtonText
                    ]}>
                      {sex}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dog Friendly */}
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

            {/* Pace */}
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

    {/* Profile Modal */}
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
                {selectedPerson?.distance?.toFixed(1)} km bort • {mapPace(selectedPerson?.pace)} hastighet • {mapSex(selectedPerson?.sex)}
              </Text>
              
              <View style={styles.bioContainer}>
                <Text style={styles.bioTitle}>Om mig</Text>
                <Text style={styles.bioText}>{selectedPerson?.bio}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#E15F18',
    position: 'relative',
  },
  userInfoContainer: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
    maxWidth: '60%', // Öka från 30% till 60%
    zIndex: 1, // Säkerställ att den ligger ovanpå andra element
  },
  userInfoText: {
    color: 'white',
    fontSize: 12,
    lineHeight: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  filterButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
  sexButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sexButton: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedSexButton: {
    backgroundColor: "#E15F18",
    borderColor: "#E15F18",
  },
  sexButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  selectedSexButtonText: {
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

export default WalkBuddyScreen;