import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline, { decode } from "polyline";
import { useFocusEffect } from "@react-navigation/native";

interface WalkItem {
  id: string;
  title: string;
  distance: string;
  duration: string;
  geometry: string;
  startPoint: { latitude: number; longitude: number };
}

interface FindWalksProps {
  navigation: any;
}

// antal tomma promenader
const EMPTY_WALKS_COUNT = 10; 

const FindWalks = (props: FindWalksProps) => {
  // Mockad data + tomma promenader
  const [walks, setWalks] = useState<WalkItem[]>(() => {
    const realWalks: WalkItem[] = [
      {
        id: "1",
        title: "Stadsparken Rundtur",
        distance: "2.5 km",
        duration: "30 min",
        geometry: "q}hlJkhrjBD`@VjBQVIh@ARRbBONE^ITCRa@UO@OJA@C@g@yDUkBI?@N@EDIiBaOOw@a@}ALEJKZI\\QtAcACOCQAEAOCMdBmA~CyBNEWPEJIJi@b@DTBTGTCDb@pETdBPrANYbA{Ah@tBmA|@]TD\\DXBTL|@\\lCr@xF@`@XvBKHIFMNUeBi@qEa@ZIm@CG[gAa@_A_@`A[XEa@",
        startPoint: { latitude: 59.85222, longitude: 17.62932 }
      },
      {
        id: "2",
        title: "Lång info förstorar knapparna såhär lkjsdflkjsldkfjlskdjflkjsdf",
        distance: "3.2 km",
        duration: "45 min",
        geometry: "umjlJoaujBj@uAH_@Yu@cAuCIW_BlDDP@t@bDzINY[eA?MKEQNa@|@Mj@LHBE@DJQh@~An@fBATS`@gApCa@bAABKVuBqFbA{BdA{BLHBELUk@eBc@sAm@cBCIIUE?u@`Bm@|Av@vBNY^y@GQ[}@Uq@CGt@aBHWPh@GJBHl@bBm@cBCIIUE?CGCI@OO]FOJU{AeEHS@e@xAaDhB`FBGFNBGDNJTINbAtCXt@I^k@tA",
        startPoint: { latitude: 59.8605, longitude: 17.642 }
      }
    ];

    // Lägg till tomma promenader
    const emptyWalks = Array(EMPTY_WALKS_COUNT).fill(null).map((_, index) => ({
      id: `empty-${index + 1}`,
      title: "",
      distance: "",
      duration: "",
      geometry: "",
      startPoint: { latitude: 0, longitude: 0 }
    }));

    return [...realWalks, ...emptyWalks];
  });

  const [selectedWalk, setSelectedWalk] = useState<string | null>(null);

  // Decoda för att visa på kartan
  const decodeGeometry = (encoded: string) => {
    if (!encoded) return [];
    const decoded = polyline.decode(encoded);
    return decoded.map(coord => ({
      latitude: coord[0],
      longitude: coord[1]
    }));
  };

  // visar uppala bör göras med gps information
  const [region, setRegion] = useState({
    latitude: 59.8586,
    longitude: 17.6450,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });

  useFocusEffect(
    React.useCallback(() => {
      setRegion({
        latitude: 59.8586,
        longitude: 17.6450,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        Promenader nära dig!
      </Text>
      
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region} 
        >
          {walks.filter(walk => walk.title).map(walk => (
            <React.Fragment key={walk.id}>
              <Marker 
                coordinate={walk.startPoint} 
                title={walk.title}
                pinColor={selectedWalk === walk.id ? "blue" : "gray"}
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
        <Text style={styles.walksHeader}>Tillgängliga promenader ({walks.filter(walk => walk.title).length})</Text>
        
        <ScrollView style={styles.scrollContainer}>
          {walks.map((walk) => (
            <TouchableOpacity 
              key={walk.id}
              style={[ 
                styles.walkButton, 
                selectedWalk === walk.id && styles.selectedWalkButton,
                !walk.title && styles.emptyWalkButton // Extra för tomma knappar
              ]}
              onPress={() => walk.title && setSelectedWalk(walk.id)}
              disabled={!walk.title}
            >
              {walk.title ? (
                <>
                  <Text style={styles.walkTitle}>{walk.title}</Text>
                  <Text style={styles.walkDetails}>
                    {walk.distance} • {walk.duration}
                  </Text>
                </>
              ) : (
                <Text style={styles.emptyWalkText}>Tom promenadplats</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 16,
  },
  headerText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
    color: "black",
    paddingHorizontal: 16,
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
  selectedWalkButton: {
    backgroundColor: "#e3f2fd",
    borderColor: "#007bff",
  },
  emptyWalkButton: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ddd",
    minHeight: 70, // Höjd på tomma knappar
  },
  walkTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  walkDetails: {
    fontSize: 14,
    color: "#666",
  },
  emptyWalkText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default FindWalks;
