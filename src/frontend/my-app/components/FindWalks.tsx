import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Modal, Pressable, TextInput } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline, { decode } from "polyline";
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';

interface Creator {
  name: string;
  age: number;
  avatar: string;
  bio: string;
}

interface WalkItem {
  id: string;
  title: string;
  distance: string;
  duration: string;
  geometry: string;
  startPoint: { latitude: number; longitude: number };
  startTime: Date;
  creator: Creator;
  minWalkers: string;
  pace: string;
  distanceToStart: string;
  features?: string[];
}

interface FindWalksProps {
  navigation: any;
}

const FindWalks = (props: FindWalksProps) => {
  const mapRef = useRef<MapView>(null);
  
  const [walks, setWalks] = useState<WalkItem[]>(() => {
    const now = new Date();
    return [
      {
        id: "1",
        title: "Stadsparken Rundtur",
        distance: "2.5 km",
        duration: "30 min",
        geometry: "q}hlJkhrjBD`@VjBQVIh@ARRbBONE^ITCRa@UO@OJA@C@g@yDUkBI?@N@EDIiBaOOw@a@}ALEJKZI\\QtAcACOCQAEAOCMdBmA~CyBNEWPEJIJi@b@DTBTGTCDb@pETdBPrANYbA{Ah@tBmA|@]TD\\DXBTL|@\\lCr@xF@`@XvBKHIFMNUeBi@qEa@ZIm@CG[gAa@_A_@`A[XEa@",
        startPoint: { latitude: 59.85222, longitude: 17.62932 },
        startTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        creator: {
          name: "Anna",
          age: 32,
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          bio: "Det här är jag blabla"
        },
        minWalkers: "3+",
        pace: "Medium",
        distanceToStart: "1.2 km",
        features: ['dog']
      },
      {
        id: "2",
        title: "Fyrisån Promenad",
        distance: "3.2 km",
        duration: "45 min",
        geometry: "umjlJoaujBj@uAH_@Yu@cAuCIW_BlDDP@t@bDzINY[eA?MKEQNa@|@Mj@LHBE@DJQh@~An@fBATS`@gApCa@bAABKVuBqFbA{BdA{BLHBELUk@eBc@sAm@cBCIIUE?u@`Bm@|Av@vBNY^y@GQ[}@Uq@CGt@aBHWPh@GJBHl@bBm@cBCIIUE?CGCI@OO]FOJU{AeEHS@e@xAaDhB`FBGFNBGDNJTINbAtCXt@I^k@tA",
        startPoint: { latitude: 59.8605, longitude: 17.642 },
        startTime: new Date(now.getTime() + 45 * 60 * 1000),
        creator: {
          name: "Johan",
          age: 28,
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          bio: "Jag heter Johan blablabla"
        },
        minWalkers: "2+",
        pace: "Låg",
        distanceToStart: "0.8 km",
        features: ['wheelchair']
      },
      {
        id: "3",
        title: "Skogspromenad",
        distance: "5.0 km",
        duration: "60 min",
        geometry: "kpjlJkxtjBTe@LHBE@DJQxAfEATFPHPFPHQNDpAhEFNDPFKBHpApDDGBGf@xAb@nA@DbAdC@EDJDJFPRl@DDFHv@uBBDnAqCnA{A@CBAdIkJFCDDDLRnANhAAJBHF^\\`C`@nCDRC`@wDjJCFBJBD?JUl@G`AFfAk@~EM|At@bC\\pA@T@Z?H?J@F?B?D?D@Jn@CD@JEHCb@QZUNQTCFLFFLKLE?N@PBFHIHr@DCRKFGPMv@fBAXD\\F^HRRKn@zA@^DTFHFBJAJr@X~BVjBQVIh@ARRbB\\jCEDN\\Pr@WPuArAA@ABFb@EDA@h@hECr@_ClFuCfHKXMVs@dBO\\[v@CBKs@KWG{@Cc@mAkDc@~@IYWf@M[Wl@CGM`@D\\HERd@Yl@Sk@c@EUu@GLkGkQKe@ENGPGPI?GHoBbEO^EFmBlEq@pACDIQGOk@@OOIQWm@Uo@MYe@hAOAeAsCYJOe@AC]cA@o@Uy@EYI@OI@Oz@aIBi@@]X{CJmAXk@GOAECIGOIW[eAo@eBGUAQGODGgB_FGc@Sk@GUk@aBEKWu@CIBICK}AsEgCsHFOfCyFIUEK`CkF@a@}AmEOa@HQFMbGuMrBqE",
        startPoint: { latitude: 59.8602, longitude: 17.642 },
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        creator: {
          name: "Maria",
          age: 45,
          avatar: "https://randomuser.me/api/portraits/women/63.jpg",
          bio: "sitter i rullstol "
        },
        minWalkers: "1+",
        pace: "Låg",
        distanceToStart: "2.5 km",
        features: ['dog', 'wheelchair']
      }
    ];
  });

  const [selectedWalk, setSelectedWalk] = useState<string | null>(null);
  const [expandedWalk, setExpandedWalk] = useState<string | null>(null);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filters, setFilters] = useState({
    wheelchair: false,
    dogFriendly: false,
    pace: {
      low: false,
      mediumLow: false,
      medium: false,
      mediumHigh: false,
      high: false
    }
  });

  const initialRegion = {
    latitude: 59.8586,
    longitude: 17.6450,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  const [region, setRegion] = useState(initialRegion);

  useFocusEffect(
    useCallback(() => {
      setRegion(initialRegion);
      mapRef.current?.animateToRegion(initialRegion, 500);
      
      return () => {
        // Cleanup
      };
    }, [])
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const decodeGeometry = (encoded: string) => {
    if (!encoded) return [];
    const decoded = polyline.decode(encoded);
    return decoded.map(coord => ({
      latitude: coord[0],
      longitude: coord[1]
    }));
  };

  const handleWalkPress = (walk: WalkItem) => {
    if (!walk.title) return;
    
    setSelectedWalk(walk.id);
    setExpandedWalk(expandedWalk === walk.id ? null : walk.id);
    
    mapRef.current?.animateToRegion({
      latitude: walk.startPoint.latitude,
      longitude: walk.startPoint.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 500);
  };

  const handleCreatorPress = (creator: Creator) => {
    setSelectedCreator(creator);
    setShowCreatorModal(true);
  };

  const handleInterestPress = () => {
    setShowInterestModal(true);
    setMessage("Hej jag skulle vilja följa med på promenaden!");
  };

  const submitInterest = () => {
    console.log("Anmälan skickad:", message);
    setShowInterestModal(false);
    setMessage("");
    alert("Din anmälan har skickats!");
  };

  const toggleFilter = (filterType: string, paceType?: string) => {
    if (paceType) {
      setFilters(prev => ({
        ...prev,
        pace: {
          ...prev.pace,
          [paceType as keyof typeof prev.pace]: !prev.pace[paceType as keyof typeof prev.pace]
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: !prev[filterType as keyof typeof prev]
      }));
    }
  };

  const filteredWalks = walks.filter(walk => {
    if (!walk.title) return false;
    
    if (filters.wheelchair && !walk.features?.includes('wheelchair')) {
      return false;
    }
    
    if (filters.dogFriendly && !walk.features?.includes('dog')) {
      return false;
    }
    
    const paceFilters = Object.entries(filters.pace).filter(([_, value]) => value);
    if (paceFilters.length > 0) {
      const walkPace = walk.pace.toLowerCase();
      const matchedPace = paceFilters.some(([key]) => {
        const paceMap: Record<string, string> = {
          low: 'låg',
          mediumLow: 'mellanlåg',
          medium: 'medium',
          mediumHigh: 'mellanhög',
          high: 'hög'
        };
        return walkPace.includes(paceMap[key]);
      });
      
      if (!matchedPace) return false;
    }
    
    return true;
  });

  const getTimeRemaining = (startTime: Date) => {
    const diff = startTime.getTime() - currentTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let color = "#ff0000";
    if (diff > 2 * 60 * 60 * 1000) {
      color = "#00aa00";
    } else if (diff > 60 * 60 * 1000) {
      color = "#ffa500";
    }

    return {
      text: `Startar om: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      color
    };
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Promenader nära dig!
        </Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          toolbarEnabled={false}    //tar bort google maps toolbar 
        >
          {filteredWalks.filter(walk => walk.title).map(walk => (
            <React.Fragment key={walk.id}>
              <Marker 
                coordinate={walk.startPoint} 
                title={walk.title}
              />
              {selectedWalk === walk.id && (
                <Polyline 
                  coordinates={decodeGeometry(walk.geometry)} 
                  strokeWidth={4} 
                  strokeColor="blue" 
                />
              )}
            </React.Fragment>
          ))}
        </MapView>
      </View>
      
      <View style={styles.walksContainer}>
        <Text style={styles.walksHeader}>
          Tillgängliga promenader ({filteredWalks.filter(walk => walk.title).length})
        </Text>
        
        <ScrollView style={styles.scrollContainer}>
          {filteredWalks.map((walk) => {
            if (!walk.title) {
              return (
                <TouchableOpacity 
                  key={walk.id}
                  style={[styles.walkButton, styles.emptyWalkButton]}
                  disabled={true}
                >
                  <Text style={styles.emptyWalkText}>Tom promenadplats</Text>
                </TouchableOpacity>
              );
            }

            const timeRemaining = getTimeRemaining(walk.startTime);
            const isExpanded = expandedWalk === walk.id;

            return (
              <TouchableOpacity 
                key={walk.id}
                style={[ 
                  styles.walkButton, 
                  selectedWalk === walk.id && styles.selectedWalkButton,
                  isExpanded && styles.expandedWalkButton
                ]}
                onPress={() => handleWalkPress(walk)}
              >
                <View style={styles.walkHeader}>
                  <Text style={styles.walkTitle}>{walk.title}</Text>
                  <View style={styles.featuresContainer}>
                    <View style={styles.minWalkersBadge}>
                      <Text style={styles.minWalkersText}>{walk.minWalkers}</Text>
                    </View>
                    {walk.features?.includes('dog') && (
                      <FontAwesome name="paw" size={16} color="#666" style={styles.featureIcon} />
                    )}
                    {walk.features?.includes('wheelchair') && (
                      <MaterialIcons name="accessible" size={16} color="#666" style={styles.featureIcon} />
                    )}
                  </View>
                </View>
                
                <View style={styles.detailsContainer}>
                  <Text style={styles.walkDetails}>
                    {walk.distance} • {walk.duration}
                  </Text>
                  <Text style={[styles.timeRemaining, { color: timeRemaining.color }]}>
                    {timeRemaining.text}
                  </Text>
                </View>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <TouchableOpacity 
                      style={styles.creatorContainer}
                      onPress={() => handleCreatorPress(walk.creator)}
                    >
                      <Image 
                        source={{ uri: walk.creator.avatar }} 
                        style={styles.creatorAvatar} 
                      />
                      <View style={styles.creatorInfo}>
                        <Text style={styles.creatorName}>
                          {walk.creator.name} ({walk.creator.age})
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Gånghastighet:</Text>
                      <Text style={styles.infoValue}>{walk.pace}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Avstånd till start:</Text>
                      <Text style={styles.infoValue}>{walk.distanceToStart}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.interestButton}
                      onPress={handleInterestPress}
                    >
                      <Text style={styles.interestButtonText}>Anmäl intresse</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Creator Modal */}
      <Modal
        visible={showCreatorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreatorModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowCreatorModal(false)}
        >
          <View style={styles.modalContainer}>
            <Pressable>
              <View style={styles.modalContent}>
                <Image 
                  source={{ uri: selectedCreator?.avatar || "" }} 
                  style={styles.modalAvatar} 
                />
                <Text style={styles.modalName}>
                  {selectedCreator?.name} ({selectedCreator?.age})
                </Text>
                <View style={styles.bioContainer}>
                  <Text style={styles.bioTitle}>Lite om mig</Text>
                  <Text style={styles.bioText}>{selectedCreator?.bio}</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Interest Modal */}
      <Modal
        visible={showInterestModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInterestModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowInterestModal(false)}
        >
          <View style={styles.interestModalContainer}>
            <Pressable>
              <View style={styles.interestModalContent}>
                <Text style={styles.interestModalTitle}>Anmäl intresse</Text>
                <Text style={styles.interestModalSubtitle}>Hej jag skulle vilja följa med på promenaden!</Text>
                
                <TextInput
                  style={styles.messageInput}
                  multiline
                  numberOfLines={4}
                  onChangeText={setMessage}
                  value={message}
                  placeholder="Lägg till information eller skicka ett meddelande"
                  placeholderTextColor="#999"
                />
                
                <View style={styles.interestButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowInterestModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Tillbaka</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={submitInterest}
                  >
                    <Text style={styles.submitButtonText}>Skicka anmälan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.filterModalContainer}>
            <Pressable>
              <View style={styles.filterModalContent}>
                <Text style={styles.filterModalTitle}>
                  Visa bara promenader med:
                </Text>
                
                {/* Rullstolstillgänglighet */}
                <TouchableOpacity 
                  style={styles.filterItem}
                  onPress={() => toggleFilter('wheelchair')}
                >
                  <View style={styles.filterTextContainer}>
                    <MaterialIcons 
                      name="accessible" 
                      size={20} 
                      color="#666" 
                      style={styles.filterIcon} 
                    />
                    <Text style={styles.filterText}>Rullstolstillgänglighet</Text>
                  </View>
                  {filters.wheelchair ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
                
                {/* Tillåter hund */}
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
                    <Text style={styles.filterText}>Tillåter hund</Text>
                  </View>
                  {filters.dogFriendly ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
                
                {/* Hastighetsfilter */}
                <Text style={styles.filterSubtitle}>Gånghastighet:</Text>
                
                <TouchableOpacity 
                  style={styles.filterItem}
                  onPress={() => toggleFilter('pace', 'low')}
                >
                  <Text style={styles.filterText}>Låg hastighet</Text>
                  {filters.pace.low ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.filterItem}
                  onPress={() => toggleFilter('pace', 'mediumLow')}
                >
                  <Text style={styles.filterText}>Mellanlåg hastighet</Text>
                  {filters.pace.mediumLow ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.filterItem}
                  onPress={() => toggleFilter('pace', 'medium')}
                >
                  <Text style={styles.filterText}>Mellan hastighet</Text>
                  {filters.pace.medium ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.filterItem}
                  onPress={() => toggleFilter('pace', 'mediumHigh')}
                >
                  <Text style={styles.filterText}>Mellanhög hastighet</Text>
                  {filters.pace.mediumHigh ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.filterItem}
                  onPress={() => toggleFilter('pace', 'high')}
                >
                  <Text style={styles.filterText}>Hög hastighet</Text>
                  {filters.pace.high ? (
                    <FontAwesome name="check-circle" size={20} color="#00aa00" />
                  ) : (
                    <FontAwesome name="times-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.applyFilterButton}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.applyFilterButtonText}>Visa resultat</Text>
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
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    
    
  },
  headerText: {
    fontSize: 16,
    textAlign: "center",
    color: "black",
  },
  filterButton: {
    backgroundColor: '#007bff', // Blå bakgrund
    borderRadius: 8, // Rundade hörn
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: 'white', // Vit text
    fontSize: 16,
    fontWeight: '500',
  },
  mapContainer: {
    height: "40%",
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  walksContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  walksHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  scrollContainer: {
    flex: 1,
  },
  walkButton: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  expandedWalkButton: {
    paddingBottom: 20,
  },
  selectedWalkButton: {
    backgroundColor: "#e3f2fd",
    borderColor: "#007bff",
  },
  emptyWalkButton: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ddd",
    minHeight: 70,
  },
  walkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  walkTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  featuresContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  minWalkersBadge: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  minWalkersText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  featureIcon: {
    marginLeft: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walkDetails: {
    fontSize: 14,
    color: "#666",
  },
  timeRemaining: {
    fontSize: 14,
    fontWeight: "500",
  },
  expandedContent: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 16,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  interestButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  interestButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyWalkText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxWidth: 400,
  },
  modalContent: {
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
    marginBottom: 16,
    color: "#333",
  },
  bioContainer: {
    width: "100%",
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  bioText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  interestModalContainer: {
    width: "90%",
    maxWidth: 500,
  },
  interestModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  interestModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  interestModalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  messageInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    marginBottom: 20,
    fontSize: 14,
    color: "#333",
    textAlignVertical: "top",
  },
  interestButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  submitButton: {
    backgroundColor: "#007bff",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
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
  },
  filterSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
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
  applyFilterButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  applyFilterButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FindWalks;