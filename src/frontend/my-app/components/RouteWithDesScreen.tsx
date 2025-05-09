import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import MapView, { LatLng, Marker, Polyline } from "react-native-maps";
import polyline from "polyline";
import { Picker } from "@react-native-picker/picker";
import MenuBar from "./menuBar";
import Arrow from "@/icons/arrow";
import { getStartEndTrip } from "./StartEndTripRoutingAPI";
import sendRouteDataHttpRequest from "./httpRequestClient";

// Hantering för menuBar navigering
interface MapProps {
  navigation: any;
}

export const RoutewithDesScreen = (props: MapProps) => {
  const [route, setRoute] = useState<LatLng[]>([]);
  const [startLocation, setStartLocation] = useState<LatLng | null>(null);
  const [endLocation, setEndLocation] = useState<LatLng | null>(null);
  const [distance, setDistance] = useState("500");
  const [menuExpand, setMenuExpand] = useState(false);
  const [showStartText, setShowStartText] = useState(true);
  const [isSelectingLocation, setIsSelectingLocation] = useState(true);
  const [isSelectingLocationEnd, setIsSelectingLocationEnd] = useState(false);
  const [startChosen, setStartChosen] = useState(false);
  const [endChosen, setEndChosen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [WalkGenerated, setWalkGenerated] = useState(false);
  const [currentWalkData, setCurrentWalkData] = useState<JSON>();

   // För att utöka/minimera menyn
  const toggleMenuExpander = () => setMenuExpand((prev) => !prev);

  // Hantering av tryck på kartan
  const handlePress = (e: any) => {
    const coordinate = e.nativeEvent.coordinate;

    // Hantering av val av startpositition
    if (isSelectingLocation) {
      setStartLocation(coordinate);
      setStartChosen(true);
      setShowStartText(false);
      setIsSelectingLocation(false);
      setTimeout(() => setIsSelectingLocationEnd(true), 100);

      // Hantering av slutposition
    } else if (isSelectingLocationEnd) {
      setEndLocation(coordinate);
      setEndChosen(true);
      setIsSelectingLocationEnd(false);
      setMenuExpand(true);
    }
  };

  // Hantering av ruttgenerering
  const fetchRouteStartDes = async () => {
    const result = await getStartEndTrip(startLocation, endLocation, 42, 3, 600);
    const decoded = polyline.decode(result.routes[0].geometry);
    const formatted = decoded.map(([lat, lon]) => ({
      latitude: lat,
      longitude: lon,
    }));
    setRoute(formatted);
    setCurrentWalkData(result);
    setShowInfo(true);
  };

  // Hantering av "spara rutt"
  const sendRouteToBackend = async () => {
    if (currentWalkData) {
      sendRouteDataHttpRequest(currentWalkData, 1); // Replace 1 with real userID
    }
  };

  return (
    <View style={styles.container}>
      {/** Text vid val av startpunkt */}
      {showStartText && (
        <View style={styles.messageContainer}>
          <Text style={styles.startText}>Klicka på kartan för att välja en startpunkt</Text>
        </View>
      )}

      {/** Hantering av kartan */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 59.8586,
          longitude: 17.6450,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handlePress}
      >
        {startLocation && <Marker coordinate={startLocation} title="Start" pinColor="white" />}
        {endLocation && <Marker coordinate={endLocation} title="Slut" pinColor="red" />}
        {route.length > 0 && <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />}
      </MapView>

      {/** Text vid val av startpunkt */}
      {isSelectingLocationEnd && (
        <View style={styles.messageContainer}>
          <Text style={styles.startText}>Klicka på kartan för att välja en slutpunkt</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {/** Knapp för aktivering av menuExpand */}
        <Pressable style={styles.arrowButton} onPress={toggleMenuExpander}>
          <Arrow width={36} height={36} angle={menuExpand} />
        </Pressable>

        {/** Visa vid expanderad meny */}
        {menuExpand && (
          <View>
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
              
              {/** Generera-knapp*/}
              <TouchableOpacity
                style={styles.buttoncontainer}
                onPress={() => {
                  if (startChosen && endChosen) {
                    fetchRouteStartDes();
                    setWalkGenerated(true);
                  } else {
                    alert("Please choose a start and end point.");
                  }
                }}
              >
                <Text style={styles.buttonTextWhite}>Generera</Text>
              </TouchableOpacity>

              {/** Återställ-knapp */}
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setStartLocation(null);
                  setEndLocation(null);
                  setStartChosen(false);
                  setEndChosen(false);
                  setIsSelectingLocation(true);
                  setIsSelectingLocationEnd(false);
                  setShowStartText(true);
                  setRoute([]);
                  setShowInfo(false);
                  setWalkGenerated(false);
                  setMenuExpand(false);
                }}
              >
                <Text style={styles.buttonTextWhite}>Återställ</Text>
              </TouchableOpacity>
            </View>

            {/** Hantering av genererad rutt */}
            {WalkGenerated && (
              <View style={styles.buttonRow}>
                {/** Spara rutt-knapp */}
                <TouchableOpacity style={styles.buttonSave} onPress={sendRouteToBackend}>
                  <Text style={styles.buttonSaveText}>Spara rutt</Text>
                </TouchableOpacity>

                {/** Information-knapp */}
                <TouchableOpacity style={styles.buttonSave}>
                  <Text style={styles.buttonSaveText}>Information</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/** MenyBar navigering*/}
      <MenuBar navigation={props.navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  messageContainer: {
    backgroundColor: '#1B2D92',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 10,
  },
  startText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 120,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  arrowButton: {
    backgroundColor: "white",
    marginBottom: 10,
  },
  buttoncontainer: {
    backgroundColor: '#1B2D92',
    borderRadius: 30,
    padding: 15,
    margin: 15,
    width: "55%",
    alignContent: "center",
  },
  resetButton: {
    backgroundColor: 'grey',
    borderRadius: 30,
    padding: 15,
    margin: 15,
  },
  buttonTextWhite: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
  },
  buttonSave: {
    backgroundColor: "#E15F18",
    padding: 12,
    borderRadius: 30,
    width: "47.5%",
    margin: 5,
  },
  buttonSaveText: {
    fontSize: 19,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});