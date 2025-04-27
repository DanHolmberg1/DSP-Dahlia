import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import MenuBar from "../components/menuBar"; 

// Mockdata för personer med bilder
const mockPeople = [
    {
      id: '1',
      name: 'Anna',
      age: 32,
      distance: 1.2,
      gender: 'Kvinna',
      bio: 'Gillar långa promenader i naturen',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      pace: 'Medium',
      features: ['dog']
    },
    {
      id: '2',
      name: 'Johan',
      age: 28,
      distance: 0.8,
      gender: 'Man',
      bio: 'Motionär som gillar att springa',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      pace: 'Hög',
      features: []
    },
    {
      id: '3',
      name: 'Maria',
      age: 45,
      distance: 2.5,
      gender: 'Kvinna',
      bio: 'Söker någon att promenera med på lunchen',
      avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
      pace: 'Låg',
      features: ['wheelchair']
    },
    {
      id: '4',
      name: 'Erik',
      age: 35,
      distance: 3.1,
      gender: 'Man',
      bio: 'Nyinflyttad och vill utforska området',
      avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
      pace: 'Medium',
      features: ['dog']
    },
    {
      id: '5',
      name: 'Sofia',
      age: 29,
      distance: 0.5,
      gender: 'Kvinna',
      bio: 'Älskar att träna och vara aktiv',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
      pace: 'Hög',
      features: []
    },
    {
      id: '6',
      name: 'Lars',
      age: 40,
      distance: 4.0,
      gender: 'Annat',
      bio: 'Gillar att vandra och vara ute i naturen',
      avatar: 'https://randomuser.me/api/portraits/men/34.jpg',
      pace: 'Låg',
      features: ['wheelchair']
    }
  ];

const FindFriend = ({ navigation }: { navigation: any }) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [lowAge, setLowAge] = useState(18);
  const [highAge, setHighAge] = useState(80);
  const [maxDistance, setMaxDistance] = useState(10);
  const [selectedGender, setSelectedGender] = useState('Alla');
  const [filters, setFilters] = useState({
    dogFriendly: false,
    pace: {
      low: false,
      medium: false,
      high: false
    }
  });

  const filteredPeople = mockPeople.filter(person => {
    // Grundläggande filter
    if (person.age < lowAge || person.age > highAge) return false;
    if (person.distance > maxDistance) return false;
    if (selectedGender !== 'Alla' && person.gender !== selectedGender) return false;
    
    // Hundvänligt filter
    if (filters.dogFriendly && !person.features?.includes('dog')) return false;
    
    // Hastighetsfilter
    const paceFilters = Object.entries(filters.pace).filter(([_, value]) => value);
    if (paceFilters.length > 0) {
      const personPace = person.pace.toLowerCase();
      const matchedPace = paceFilters.some(([key]) => {
        const paceMap: Record<string, string> = {
          low: 'låg',
          medium: 'medium',
          high: 'hög'
        };
        return personPace.includes(paceMap[key]);
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

  const handlePersonPress = (personId: string) => {
    setExpandedPerson(expandedPerson === personId ? null : personId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Personer nära dig! ({filteredPeople.length})
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
          <TouchableOpacity
            key={person.id}
            style={[
              styles.personCard,
              expandedPerson === person.id && styles.expandedCard
            ]}
            onPress={() => handlePersonPress(person.id)}
          >
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
              </View>
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
                  style={styles.messageButton}
                  onPress={() => {
                    setSelectedPerson(person);
                  }}
                >
                  <Text style={styles.messageButtonText}>Skicka meddelande</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
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
                  minimumTrackTintColor="#007bff"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#007bff"
                  value={lowAge}
                  onValueChange={(value) => setLowAge(Math.min(value, highAge - 1))}
                />
                <Slider
                  style={styles.slider}
                  minimumValue={lowAge + 1}
                  maximumValue={80}
                  step={1}
                  minimumTrackTintColor="#007bff"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#007bff"
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
                  minimumTrackTintColor="#007bff"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#007bff"
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
                  <Text style={styles.filterText}>Låg</Text>
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
                  <Text style={styles.filterText}>Medium</Text>
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
                  <Text style={styles.filterText}>Hög</Text>
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
                  {selectedPerson?.distance} km bort • {selectedPerson?.pace} hastighet
                </Text>
                
                <View style={styles.bioContainer}>
                  <Text style={styles.bioTitle}>Om mig</Text>
                  <Text style={styles.bioText}>{selectedPerson?.bio}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.modalMessageButton}
                  onPress={() => {
                    setSelectedPerson(null);
                    navigation.navigate('Messages', { person: selectedPerson });
                  }}
                >
                  <Text style={styles.modalMessageButtonText}>Skicka meddelande</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <MenuBar 
      iconFocus="PROFILE" // eller 'HOME' beroende på vilken skärm du är på
      navigation={navigation} 
    />
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingBottom: 100,
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
    backgroundColor: "#007bff",
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
    backgroundColor: "#007bff",
    borderColor: "#007bff",
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
    backgroundColor: "#007bff",
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
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    width: '100%',
  },
  modalMessageButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default FindFriend;