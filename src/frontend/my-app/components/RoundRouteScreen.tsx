import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline, { decode } from "polyline";
import { start } from "repl";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker"; 
import { abort } from "process";
import Arrow from "@/icons/arrow";
import { getStartEndTrip } from "./StartEndTripRoutingAPI";
import{getRouteWithStops} from "./RoundTripLocations";
import { ws, sendToBackend } from "./webSocketsClient";
import sendRouteDataHttpRequest from "./httpRequestClient";
import { all } from "axios";
import { getRoundTripRoute } from "./RoundTripRoutingAPI";
import MenuBar from "./menuBar";


interface MapProps {
    navigation:any
}

export const RoundRouteScreen = (props:MapProps) => {

  const [route, setRoute] = useState<{longitude: number, latitude: number }[]>([]);
  const [distance, setDistance] = useState('500');
  const [menuExpand, setMenuExpand] = useState<boolean>(false);
  const [optionExpand, setOptionExpand] = useState<boolean>(false);
  const [startLocation, setStartLocation] = useState<{latitude: number; longitude: number} | null> (null);
  const distanceOptions = ['500', '700', '1000', '1500', '2000', '2500'];
  const pointValues = [3, 4, 5];
  const pickerRef = useRef<Picker<string> | null>(null); 
  const [showStartText, setShowStartText] = useState<boolean>(true);
  const [geometry, setGeometry] = useState('');
  const [ShowRoundTrip, setShowRoundTrip] = useState<boolean>(false);
  const [ShowtripWithDes, setShowTripWitDes] = useState<boolean>(false);
  const [ShowtripWitStops, setShowTripWihStops] = useState<boolean>(false);
  const [ShowOptions, setShowOptions] = useState<boolean>(false);
  const [HasShowOptions, setHasShowOptions] = useState<boolean>(false);
  const [WalkGenerated, setWalkGenerated]= useState<boolean>(false);
  const [currentWalkData, setCurrentWalkData] = useState<JSON>();
  const [startChosen, setStartChosen] = useState(false);

  const toggleMenuExpander = () => setMenuExpand(prev => !prev);

  const fetchRoundTripRoute = async () => {
    setWalkGenerated(true);
      const randomFactor = Math.random() + 1;
      const randomPoints = Math.floor(Math.random()* pointValues.length);
      const randomSeed = Math.floor(Math.random()* 1000);
      const distanceNum = Number(distance);

      const result = await getRoundTripRoute(startLocation, distanceNum, randomSeed, 3);
      const resultGeometry = result.routes[0].geometry;
     
          const decodegeom = polyline.decode(resultGeometry);
         
          console.log("geo ", decodegeom);

          const formattedRoute = decodegeom.map((coord: number[]) => ({
              latitude: coord[0],
              longitude: coord[1],
            }));
            console.log("Final route coordinates:", formattedRoute);

          setRoute(formattedRoute);
          setCurrentWalkData(result);
          console.log("distance", result.routes[0].summary.distance);
    };

    const sendRouteToBackend = async () => {
      console.log("send data");
      if(currentWalkData) {
        console.log("send data walk");
      //sendToBackend(ws, currentWalkData, 1); 
      sendRouteDataHttpRequest(currentWalkData, 1); // 1 = userID, placeholder
      }
    }

return (

    
<View style={styles.container}>

    {/**Välj startpunkt */}
    {showStartText && (
        <View style={styles.messageContainer}> 
            <Text style={styles.startText}> Klicka på kartan för att välja en startpunkt </Text> 
        </View>  )} 

      {/**Kartan och dess starpunkt */}
    <MapView
            style={styles.map}
            initialRegion={{
            latitude: 59.8586, //Example center (Uppsala) TODO: is it possible to change the start screen based on user location?
            longitude: 17.6450,
            latitudeDelta: 0.05, // Zoom level
            longitudeDelta: 0.05,
            }}

            onPress={(e) => {setStartLocation(e.nativeEvent.coordinate)
                              setStartChosen(true);
                              setMenuExpand(true);
                              setShowStartText(false);
                              setShowRoundTrip(true);

            console.log('ShowOptions:', ShowOptions);
            }}
        >
            {startLocation && <Marker coordinate={startLocation} title="Start" pinColor="white"/>}
            {/* Render the route on the map */}
            {route.length > 0 && <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" /> }
        </MapView> 

        {ShowRoundTrip && (
  <View style={styles.panelContainer}>  
      <Pressable
        style={styles.arrowButton}
        onPress={toggleMenuExpander}
      >
        <Arrow width={36} height={36} angle={menuExpand} />
      </Pressable>
      <Text style={styles.inputLable}>Välj längd på promenaden</Text>
    
      {menuExpand && (
  <>
    <View style={styles.pickerBlock}>
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
      <TouchableOpacity
        style={styles.buttoncontainer}
        onPress={() => {
          if (!startChosen) {
            alert("Please choose a starting point.");
          } else {
            fetchRoundTripRoute();
          }
        }}
      >
        <Text style={styles.buttonTextWhite}>   Generera   </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          setShowStartText(true);
          setStartLocation(null);
          setStartChosen(false);
          setRoute([]);
          setMenuExpand(false);
          setWalkGenerated(false);
          setShowRoundTrip(false);
        }}
      >
        <Text style={styles.buttonTextWhite}>Återställ</Text>
      </TouchableOpacity>
    </View>

    {WalkGenerated && (
      <View style={styles.buttonRow}>
          <TouchableOpacity
          style={styles.buttonSave}
          onPress={sendRouteToBackend}
        >
          <Text style={styles.buttonSaveText}>Spara rutt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSave}
        >
            <Text style={styles.buttonSaveText}>Information</Text>
        </TouchableOpacity>
      </View>
    )}
  </>
)}

  </View>
)}
  <MenuBar navigation={props.navigation}/>

</View>
  
)}

const styles = StyleSheet.create({
container: { flex: 1 },
map: { flex: 1 },

messageContainer: {
    backgroundColor: '#1B2D92',
    padding: 10, // Add some padding to make it look less cramped
    alignItems: 'center', // Center the text
    justifyContent: 'center',
    position: 'absolute', // Position it over the screen if needed
    top: 0, // Position it at the top or adjust based on your layout
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it sits above other elements
},
inputLable: {
    fontSize: 25,
    color:"black",
    margin: 30,
    fontWeight: "bold",
    textAlign: "center",
},

buttoncontainer: {
    padding: 15,
    margin: 15,
    backgroundColor: '#1B2D92',
    borderRadius: 30,
    borderColor: "black",
    color: "white",
    alignContent: "center",
    width: "60%",
},

startText: {
    fontSize: 22,
    color:"white",
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 0,
    textAlign: "center",
    fontWeight: "bold",
},

buttoncontainerRoundTrip: {
  width: "40%",
  marginBottom: 30,
  backgroundColor: 'white',
  position: "absolute",
  bottom: 0,
  borderRadius: 30,
  borderColor: "white",
  color: "black",
  left: -5,
},
buttonTextWhite: {
  color: "#fff",
  fontSize: 22,
  fontWeight: "bold",
  textAlign: "center",
},

pickerWrapper: {
  backgroundColor: "white",
  width: "100%",
  paddingVertical: 20,
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  position: "absolute",
  bottom: 0,
  zIndex: 5,
  alignItems: "center",
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

arrowButton: {
  backgroundColor: "white",
},

pickerBlock: {
  backgroundColor: "#F5BFA2",
  borderRadius: 30,
  width: "100%",
  marginBottom: 0,
  overflow: "hidden",
},

pickerContainer: {
  height: 80,
  width: "100%",
},
resetButton: {
    backgroundColor: 'grey',
    borderRadius: 30,
    borderColor: "black",
    color: "white",
    alignContent: "center",
    padding: 15,
    margin: 15,
},
buttonText: {
  color: "white",
  fontSize: 25,
  textAlign:'center',
  fontWeight: 'bold'
},
button: {
  backgroundColor: "#1B2D92",
  padding: 20,
  margin: 4,
  borderRadius: 30,
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
  marginLeft: 7,
  marginRight: 7,
},
buttonSaveText: {
  fontSize: 19,
  color: "white",
  textAlign: "center",
  fontWeight: "bold",
},
});