import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import polyline from "polyline";
import Arrow from "@/icons/arrow";
import MenuBar from "./menuBar";
import { getRoundTripRoute } from "./RoundTripRoutingAPI";
import sendRouteDataHttpRequest from "./httpRequestClient";

// Hantering av menuBar navigation
interface MapProps {
  navigation: any;
}

export const RoundRouteScreen = (props: MapProps) => {
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>(
    []
  );
  const [distance, setDistance] = useState("500");
  const [menuExpand, setMenuExpand] = useState(false);
  const [showStartText, setShowStartText] = useState(true);
  const [walkGenerated, setWalkGenerated] = useState(false);
  const [currentWalkData, setCurrentWalkData] = useState<JSON>();
  const [startChosen, setStartChosen] = useState(false);
  const [startLocation, setStartLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const pickerRef = useRef<Picker<string> | null>(null);
  const toggleMenuExpander = () => setMenuExpand((prev) => !prev);

  // Hantera generering av path
  const fetchRoundTripRoute = async () => {
    setWalkGenerated(true);
    const randomSeed = Math.floor(Math.random() * 1000);
    const distanceNum = Number(distance);

    const result = await getRoundTripRoute(startLocation, distanceNum, randomSeed, 3);
    const decoded = polyline.decode(result.routes[0].geometry);
    const formattedRoute = decoded.map(([lat, lon]) => ({
      latitude: lat,
      longitude: lon,
    }));

    setRoute(formattedRoute);
    setCurrentWalkData(result);
  };

  // Hantering av "spara rutter"
  const sendRouteToBackend = async () => {
    if (currentWalkData) {
      sendRouteDataHttpRequest(currentWalkData, 1);
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
          longitude: 17.645,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={(e) => {
          setStartLocation(e.nativeEvent.coordinate);
          setStartChosen(true);
          setMenuExpand(true);
          setShowStartText(false);
        }}
      >
        {startLocation && (
          <Marker coordinate={startLocation} title="Start" pinColor="white" />
        )}
        {route.length > 0 && (
          <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />
        )}
      </MapView>

      {/** Hantering efter vald startpunkt */}
      {startChosen && (
        <View style={styles.panelContainer}>

          {/** Toggle menuExpand */}
          <Pressable style={styles.arrowButton} onPress={toggleMenuExpander}>
            <Arrow width={36} height={36} angle={menuExpand} />
          </Pressable>

          <Text style={styles.inputLabel}>Välj längd på promenaden</Text>

          {menuExpand && (
            <>
              <View style={styles.pickerBlock}>
                {/** Val av längd på rutt */}
                <Picker
                  ref={pickerRef}
                  selectedValue={distance}
                  onValueChange={(value) => setDistance(value)}
                  style={styles.pickerContainer}
                  mode="dropdown"
                >
                  <Picker.Item label="500 meter" value="500" />
                  <Picker.Item label="1 km" value="1000" />
                  <Picker.Item label="1,5 km" value="1500" />
                  <Picker.Item label="2 km" value="2000" />
                  <Picker.Item label="2.5 km" value="2500" />
                  <Picker.Item label="3 km" value="3000" />
                  <Picker.Item label="3.5 km" value="3500" />
                  <Picker.Item label="4 km" value="4000" />
                  <Picker.Item label="4.5 km" value="4500" />
                  <Picker.Item label="5 km" value="5000" />
                </Picker>
              </View>

              <View style={{ flexDirection: "row" }}>
                {/** Generera-knapp */}
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={() => {
                    if (!startChosen) {
                      alert("Please choose a starting point.");
                    } else {
                      fetchRoundTripRoute();
                    }
                  }}
                >
                  <Text style={styles.buttonTextWhite}>Generera</Text>
                </TouchableOpacity>

                  {/** Återställ-knapp */}
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setShowStartText(true);
                    setStartLocation(null);
                    setStartChosen(false);
                    setRoute([]);
                    setMenuExpand(false);
                    setWalkGenerated(false);
                  }}
                >
                  <Text style={styles.buttonTextWhite}>Återställ</Text>
                </TouchableOpacity>
              </View>

              {/** Hantering efter genererad rutt */}
              {walkGenerated && (
                <View style={styles.buttonRow}>
                  {/** "Spara rutt"-knapp */}
                  <TouchableOpacity style={styles.buttonSave} onPress={sendRouteToBackend}>
                    <Text style={styles.buttonSaveText}>Spara rutt</Text>
                  </TouchableOpacity>

                  {/** Information-knapp */}
                  <TouchableOpacity style={styles.buttonSave}>
                    <Text style={styles.buttonSaveText}>Information</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/** MenuBar navigering */}
      <MenuBar navigation={props.navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  messageContainer: {
    backgroundColor: "#1B2D92",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  startText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginVertical: 20,
    paddingHorizontal: 15,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 25,
    color: "black",
    margin: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  panelContainer: {
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
  pickerBlock: {
    backgroundColor: "#F5BFA2",
    borderRadius: 30,
    width: "100%",
    marginBottom: 10,
    overflow: "hidden",
  },
  pickerContainer: {
    height: 80,
    width: "100%",
  },
  arrowButton: {
    backgroundColor: "white",
  },
  buttonContainer: {
    padding: 15,
    margin: 15,
    backgroundColor: "#1B2D92",
    borderRadius: 30,
    width: "55%",
  },
  resetButton: {
    backgroundColor: "grey",
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
  buttonSave: {
    backgroundColor: "#E15F18",
    padding: 12,
    borderRadius: 30,
    width: "50%",
    margin: 5,
  },
  buttonRow: {
    flexDirection: "row",
    marginHorizontal: 7,
  },
  buttonSaveText: {
    fontSize: 19,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
