// TripWithStopsScreenSingleFile.tsx
import React, { useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import polyline from "polyline";
import { getRouteWithStops } from "./RoundTripLocations";
import { getClosestLocation } from "./FindClosestLocation";
import { StyleSheet, TextInput, View, Text, Button, 
        KeyboardAvoidingView, Platform, TouchableWithoutFeedback, 
        Keyboard, TouchableOpacity,  } from "react-native";
import { translatedAdress } from "./TranslateAdressToCoordinare";



const categories = ["Café", "Library", "Restaurant", "Museum", "Toilet", "Store", "Other"];

export default function TripWithStopsScreen() {
  type LatLng = { latitude: number; longitude: number };

  const [stops, setStops] = useState<LatLng[]>([]);
  const [startLocation, setStartLocation] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [address, setAddress] = useState("");
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [showPickStop, setPickStop] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [showMultipleChoice, setShowMultipleChoice] = useState(false);
  const [StartButtontext, setStartButtonText] = useState(true);
  const [startChosen, setStartChosen] = useState(false);
  const [buttontext, setButtontext] = useState(false);
  const [containerColor, setContainerColor] = useState('rgba(106, 191, 112, 0.8)');
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [reset, setReset] = useState(false);
  const [generate, setGenerate] = useState(false);
  

  // Hantering av klick på kartan
  const handlePressColorContainer = () => {
    setContainerColor(containerColor === "rgba(106, 191, 112, 0.8)" ? "rgba(224, 151, 151, 0.8)" : "rgba(106, 191, 112, 0.8)"); // Toggle between white and light blue
  };

  const handlePress = (e: any) => {
    const coordinate = e.nativeEvent.coordinate;
    if(isSelectingLocation) {  
      setStartLocation(coordinate);  
      setIsSelectingLocation(false);
      setStartButtonText(false);
      setStartChosen(true);
      setButtontext(true);
      handlePressColorContainer();
      setShowMultipleChoice(true);
    } else if (isAddingStop) {
      setStops(prev => [...prev, coordinate]);
      setIsAddingStop(false); // om du bara vill lägga till ett i taget
      setShowMultipleChoice(true);
    }
  }

  // Hantering av startlocation
  const handleSetStartLocation = () => {
  setIsSelectingLocation(true);  // Allow map press to select a location
  }


  const handleAddressConfirm = async () => {
    const result = await translatedAdress(address);
    if (result) {
      setStops(prev => [...prev, result]); // Lägg till i stops
      setShowAddressInput(false); // Stäng inputrutan
      setAddress(""); // Rensa inputfält
    } else {
      alert("No location found for this address.");
    }
  };
  

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}

        onPress={handlePress}>

        {/** Start location och map view?? */}
        {startLocation && <Marker coordinate={startLocation} title="Start" />}
        {stops.map((stop, index) => (
          <Marker key={index} coordinate={stop} title={`Stop ${index + 1}`} />
        ))}
        {route.length > 0 && <Polyline coordinates={route} strokeWidth={3} strokeColor="blue" />}
      </MapView>

      {/** Meddelande popup - välj en startpunkt på kartan */}
      {isSelectingLocation &&(
        <View style= {styles.messageContainer}>
          <Text style= {styles.startText}> Choose start point by clicking on the map </Text>
        </View>
      )}

      {/** View "Walk with stops" */}
      <View style={styles.card}>

        {/** Knapp för att initiera val av startpunkt på kartan */}
        {!startChosen && (
          <View style={styles.chooseStartView}>
          <TouchableOpacity 
          style={[styles.bigButtonContainer]}
          onPress={handleSetStartLocation}>
            
            <Text style={[styles.buttonTextBlueReset, {marginLeft: Platform.OS === 'android' ? -10: 0}]}>
              Confirm startingpoint
              </Text>
          </TouchableOpacity>
          <Text style={styles.descriptionText}>By navigating and pressing on the map</Text>
          
          {/**LÄGGA TILL ADRESS SOM STARTPUNKT? TODO: */}
          {/* <TouchableOpacity 
          style={[styles.smallButtonContainer]}
          onPress={() => setShowAddressInput(true)}
            >
            
            <Text style={[styles.buttonTextBlueReset, {marginLeft: Platform.OS === 'android' ? -10: 0}]}>
              Write adress
              </Text>

          </TouchableOpacity> */}

          </View>

          

          
        )}

      {/** Funktionalitet av vy av multiple choise (add, pick, adress) */}
      {showMultipleChoice && (

          <View style={styles.column}>
            <Text style={styles.descriptionText}>Choose alternatives to build your route</Text>

            {/** Lägg till via karttryck */}
          <TouchableOpacity style={styles.button} 
            onPress={() => {
              alert("Tap on the map to add next stop");
              setShowMultipleChoice(false);
              setIsAddingStop(true);
              
            }}
          >
            <Text style={styles.buttonText}>Add stop on map</Text>
          </TouchableOpacity>

            {/** Lägg till via adress */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowAddressInput(true)}
            >
            <Text style={styles.buttonText}>Add address</Text>
          </TouchableOpacity>

            {/** Lägg till via flerval */}
          <TouchableOpacity style={styles.button} 
            onPress={() => setPickStop(true)}>
            <Text style={styles.buttonText}>Pick stop</Text>
          </TouchableOpacity>
            
          <View style={styles.row}>

            {/** Återställ */}
          <TouchableOpacity style={styles.resetButton} 
            onPress={() => {
                setButtontext(false);
                setStartLocation(null);
                setStartChosen(false);
                setIsSelectingLocation(false);
                setRoute([]);
                setContainerColor('rgba(7, 67, 11, 0.8)');
                setShowMultipleChoice(false);
                setStops([]);
                setAddress("");

              }}
            >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>

            {/** Generate route */}
            <TouchableOpacity style={styles.generateButton} 
              onPress={async () => {
                if (!startLocation) return alert("Choose a start location");
                const result = await getRouteWithStops(startLocation, stops, 20000);
                if (result) {
                  const decoded = polyline.decode(result.geometry);
                  const formatted = decoded.map(([lat, lon]) => ({ latitude: lat, longitude: lon }));
                  setRoute(formatted);
                }
              }}>
            <Text style={styles.buttonText}>Generate</Text>
          </TouchableOpacity>
          </View>
          </View>

      )}
        
        {showAddressInput && (
  <>
    <TextInput
      placeholder="Write an address..."
      style={styles.inputRoute}
      value={address}
      onChangeText={setAddress}
    />
    <Button
      title="Confirm address"
      onPress={handleAddressConfirm}
    />
  </>
)}


        {/** Funktionalitet - stopp via flervalsalternativ */}
        {showPickStop && (
            <View>
            <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
            style={styles.picker}
            mode="dropdown"
          >
            {categories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
          <Button
            title="Confirm stop"
            onPress={async () => {
              if (!startLocation) {
                alert("Choose a start location first");
                return;
              }
              const nearest = await getClosestLocation(startLocation, selectedCategory);
              if (nearest && nearest.lat != null && nearest.lon != null) {
                const latlng: LatLng = {
                  latitude: nearest.lat,
                  longitude: nearest.lon
                };
                setStops(prev => [...prev, latlng]);
              } else {
                alert("No valid location found.");
              }

              setPickStop(false);
            }}
          />
          </View>
          
        )}

          {/**  Funktionalitet - reset knapp */}
          {reset && (
          <View style={styles.buttoncontainerReset}>
            <TouchableOpacity
              // add some styling!
              onPress={() => {
                setButtontext(false);
                setStartLocation(null);
                setStartChosen(false);
                setIsSelectingLocation(false);
                setRoute([]);
                setContainerColor('rgba(7, 67, 11, 0.8)');
              }}
            >
              <Text style={[styles.buttonTextBlueReset, {marginLeft: Platform.OS === 'android' ? -10: 0}]}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/**  Funktionalitet - generate knapp */}
        {generate && (
        <View>
        <TouchableOpacity 
          onPress={async () => {
            if (!startLocation) return alert("Choose a start location");
            const result = await getRouteWithStops(startLocation, stops, 20000);
            if (result) {
              const decoded = polyline.decode(result.geometry);
              const formatted = decoded.map(([lat, lon]) => ({ latitude: lat, longitude: lon }));
              setRoute(formatted);
            }
          }}
        >
          <Text style={[styles.buttonTextBlueReset, { marginLeft: Platform.OS === 'android' ? -10 : 0 }]}>
            Generate
          </Text>
        </TouchableOpacity>
        </View>
        )}
      </View>
    </View>
  );
}

{/** Utseende */}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 30,
    position: 'relative',
  },
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
    gap: 10
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
  routeStops: {
    backgroundColor: 'rgba(224, 225, 229, 0.96)',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    marginLeft: 40
  },
  messageContainer: {
    backgroundColor: 'rgba(6, 18, 87, 0.8)',
    padding: 10, // Add some padding to make it look less cramped
    alignItems: 'center', // Center the text
    justifyContent: 'center',
    position: 'absolute', // Position it over the screen if needed
    top: 0, // Position it at the top or adjust based on your layout
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it sits above other elements
  },
  startText: {
    fontSize: 20,
    color:"white",
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 0,
},

buttoncontainerReset: {
  width: "90%",           // The width of the button container
  backgroundColor: 'orange',  // Background color of the container
  position: "absolute",   // Position the container absolutely
  top: 130,                 // Align the container to the top of the screen
  left: 15,                // Align the container to the left side of the screen
  borderRadius: 20,       // Rounded corners for the button container
  borderColor: "black",   // Border color for the button container
  borderWidth: 1,         // Set border width if needed
  padding:0,            // Padding for better visual appearance
  color: "black", 
  height: 40,        // Text color (though the button text color will be separate)
},
buttonTextBlueReset: {
  color: 'white',
  fontSize: 25,
  marginTop: 3,
  textAlign: 'center',
  fontWeight: 'bold',
},
bigButtonContainer: {
  backgroundColor: '#1B2D92',
  padding: 20,
  borderRadius: 30,
  
},
smallButtonContainer: {
  backgroundColor: '#1B2D92',
  padding: 20,
  borderRadius: 30,
  margin: 20,
},
chooseStartView: {
  padding: 20,
},

descriptionText: {
  textAlign: 'center',
  margin: 15,
  fontSize: 17,
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
}

});