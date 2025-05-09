import React, { useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import polyline from "polyline";
import { getRouteWithStops } from "./RoundTripLocations";
import { getClosestLocation } from "./FindClosestLocation";
import  {translatedAdress}  from "./TranslateAdressToCoordinare"
import MenuBar from "./menuBar";
import sendRouteDataHttpRequest from "./httpRequestClient";
import Arrow from "@/icons/arrow";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Till navigeringsmenyn
interface RouteProps {
  navigation: any;
}

// Latitude och longitude
type LatLng = { latitude: number; longitude: number };

// För picker - platser att generera på kartan
const categories = ["Café", "Library", "Restaurant", "Museum", "Toilet", "Store", "Other"];

export default function TripWithStopsScreen(props: RouteProps) {
  const [stops, setStops] = useState<LatLng[]>([]);
  const [startLocation, setStartLocation] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [address, setAddress] = useState("");
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [showPickStop, setPickStop] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [isSelectingLocation, setIsSelectingLocation] = useState(true);
  const [showMultipleChoice, setShowMultipleChoice] = useState(false);
  const [StartButtontext, setStartButtonText] = useState(true);
  const [startChosen, setStartChosen] = useState(false);
  const [buttontext, setButtontext] = useState(false);
  const [containerColor, setContainerColor] = useState("rgba(106, 191, 112, 0.8)");
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [reset, setReset] = useState(false);
  const [generate, setGenerate] = useState(false);
  const [showStartText, setShowStartText] = useState(true);
  const [ShowOptions, setShowOptions] = useState(false);
  const [isSelectingStart, setSelectingStart] = useState(true);
  const [WalkGenerated, setWalkGenerated] = useState(false);
  const [currentWalkData, setCurrentWalkData] = useState<JSON>();
  const [menuExpand, setMenuExpand] = useState(true);
  const [showAddStopOptions, setShowAddStopOptions] = useState(true);


  // För att utöka/minimera menyn
  const toggleMenuExpander = () => setMenuExpand(prev => !prev);

  // Hantering av tryck på kartan
  const handlePress = (e: any) => {
    const coordinate = e.nativeEvent.coordinate;

    // Hantering startposition
    if (isSelectingStart) {
      setStartLocation(coordinate);
      setStartChosen(true);
      setShowMultipleChoice(true);
      setShowStartText(false);
      setSelectingStart(false);
      setMenuExpand(true);
      return;
    }
    // Hantering "addera stop på "kartan"
    else if (isAddingStop) {
      setStops(prev => [...prev, coordinate]);
      setIsAddingStop(false);
      setShowMultipleChoice(true);
    }
  };

  // Hantering av inskriven adress
  const handleAddressConfirm = async () => {
    const result = await translatedAdress(address);
    if (result) {
      setStops(prev => [...prev, result]);
      setShowAddressInput(false);
      setAddress("");
      setShowMultipleChoice(true);
    } else {
      alert("No location found for this address.");
    }
  };

  // Hantering "spara rutt"
  const sendRouteToBackend = async () => {
    if (currentWalkData) {
      sendRouteDataHttpRequest(currentWalkData, 1); // Placeholder user ID
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/** Text - val av startposition */}
      {showStartText && (
        <View style={styles.messageContainer}>
          <Text style={styles.startText}>Klicka på kartan för att välja en startpunkt</Text>
        </View>
      )}

      {/** Kartan */}
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
        {stops.map((stop, index) => (
          <Marker key={index} coordinate={stop} title={`Stop ${index + 1}`} />
        ))}
        {route.length > 0 && <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />}
      </MapView>

      {/** Expandable menu */}
      <View style={styles.card}>

        {/** Pil - toggle menuExpand */}
        <Pressable style={styles.arrowButton} onPress={toggleMenuExpander}>
          <Arrow width={36} height={36} angle={menuExpand} />
        </Pressable>

        {/** När menyn är expanded */}
        {menuExpand && (
          <>
            {/** Avbryt-knapp för "lägg till stopp på kartan" */}
            {isAddingStop && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowMultipleChoice(true);
                  setIsAddingStop(false);
                }}
              >
                <Text style={styles.confirmText}>Avbryt</Text>
              </TouchableOpacity>
            )}

            {/** Visa alla val på menyn */}
            {showMultipleChoice && (
              <View style={styles.column}>
                <Text style={styles.descriptionText}>Välj alternativ för att bygga din rutt</Text>

                {showAddStopOptions && (
  <>

                {/** "Lägg till stopp på kartan" */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setShowMultipleChoice(false);
                    setIsAddingStop(true);
                  }}
                >
                  <Text style={styles.buttonText}>Klicka på kartan</Text>
                </TouchableOpacity>

                {/** Lägg till stopp via adress */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setShowAddressInput(true);
                    setPickStop(false);
                    setShowMultipleChoice(false);
                  }}
                >
                  <Text style={styles.buttonText}>Skriv en adress</Text>
                </TouchableOpacity>

                {/** Lägg till stopp via Picker */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setPickStop(true);
                    setShowAddressInput(false);
                    setShowMultipleChoice(false);
                  }}
                >
                  <Text style={styles.buttonText}>Välj plats-kategori</Text>
                </TouchableOpacity>

                </>
          )}

                {/** Återställ-knapp */}
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => {
                      setButtontext(false);
                      setStartLocation(null);
                      setStartChosen(false);
                      setIsSelectingLocation(false);
                      setRoute([]);
                      setContainerColor("rgba(7, 67, 11, 0.8)");
                      setShowMultipleChoice(false);
                      setStops([]);
                      setAddress("");
                      setSelectingStart(true);
                      setShowStartText(true);
                      setShowAddStopOptions(true);
                      setWalkGenerated(false);
                    }}
                  >
                    <Text style={styles.buttonText}>Återställ</Text>
                  </TouchableOpacity>

                  {/** Generera-knapp */}
                  {!WalkGenerated && (
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={async () => {
                      if (!startLocation) return alert("Choose a start location");
                      const result = await getRouteWithStops(startLocation, stops, 20000);
                      if (result) {
                        const decoded = polyline.decode(result.geometry);
                        const formatted = decoded.map(([lat, lon]) => ({
                          latitude: lat,
                          longitude: lon,
                        }));
                        setRoute(formatted);
                        setWalkGenerated(true);
                        setCurrentWalkData(result);
                        setShowAddStopOptions(false);
                      }
                    }}
                  >
                    <Text style={styles.buttonText}>Generera</Text>
                  </TouchableOpacity>
                )}

                </View>

                {/** Visa "spara rutt" samt "information" om rutten */}
                {WalkGenerated && (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.buttonSave} onPress={sendRouteToBackend}>
                      <Text style={styles.buttonSaveText}>Spara rutt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonSave}>
                      <Text style={styles.buttonSaveText}>Information</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/** Hantera "skriv in adress" */}
            {showAddressInput && (
              <>
                <TextInput
                  placeholder="Skriv en adress..."
                  style={styles.inputRoute}
                  value={address}
                  onChangeText={setAddress}
                />
                <View style={styles.confirmButtonPair}>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleAddressConfirm}>
                    <Text style={styles.confirmText}>Bekräfta stopp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowAddressInput(false);
                      setShowMultipleChoice(true);
                    }}
                  >
                    <Text style={styles.confirmText}>Avbryt</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/** Hantera picker */}
            {showPickStop && (
              <View>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                  style={styles.picker}
                >
                  {categories.map(cat => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
                <View style={styles.confirmButtonPair}>

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={async () => {
                      if (!startLocation) return alert("Välj en startpunkt");
                      const nearest = await getClosestLocation(startLocation, selectedCategory);
                      if (nearest?.lat != null && nearest?.lon != null) {
                        setStops(prev => [
                          ...prev,
                          { latitude: nearest.lat, longitude: nearest.lon },
                        ]);
                      } else {
                        alert("Hittade ingen lämplig plats.");
                      }
                      setPickStop(false);
                      setShowMultipleChoice(true);
                    }}
                  >
                    <Text style={styles.confirmText}>Bekräfta stopp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setPickStop(false);
                      setShowMultipleChoice(true);
                    }}
                  >
                    <Text style={styles.confirmText}>Avbryt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </View>
      {/** MenuBar navigation */}
      <MenuBar navigation={props.navigation} />
    </SafeAreaView>
  );
}


{/** Utseende */}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 30,
    position: 'relative',
    bottom: 100,
  },
  map: { flex: 1 },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10
  },
  column: {
    flexDirection: "column",
    justifyContent: "space-between",
    margin: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#1B2D92",
    padding: 20,
    margin: 4,
    borderRadius: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 25,
    textAlign:'center',
    fontWeight: 'bold'
  },
  inputRoute: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    marginTop: 10,
    borderRadius: 8
  },
  picker: {
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: 8,
    height: 50,
    marginBottom: 20
  },
  messageContainer: {
    backgroundColor: '#1B2D92',
    padding: 15, // Add some padding to make it look less cramped
    alignItems: 'center', // Center the text
    justifyContent: 'center',
    position: 'absolute', // Position it over the screen if needed
    top: 0, // Position it at the top or adjust based on your layout
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it sits above other elements
  },
  startText: {
    fontSize: 22,
    color:"white",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
    textAlign: "center",
  },
  descriptionText: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: 'grey',
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  generateButton: {
    backgroundColor: '#E15F18',
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  menuBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'white',
    zIndex: 99,
  },
  confirmButtonPair: {
    flexDirection: "row",
  },
  confirmButton: {
    backgroundColor: '#E15F18',
    padding: 15,
    borderRadius: 20,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: 'grey',
    padding: 15,
    borderRadius: 20,
  },
  confirmText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 19,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 5,
  },
  buttonSaveText: {
    fontSize: 19,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonSave: {
    backgroundColor: "#E15F18",
    padding: 12,
    borderRadius: 30,
    width: "47.5%",
    margin: 5,
  },
  arrowButton: {
    position: "absolute",
    top: -10,               // Lyft ovanför den expanderbara menyn
    left: "50%",            // Placera mitten horisontellt
    backgroundColor: "white",
    borderRadius: 30,
    padding: 5,
    zIndex: 20,
  },
});