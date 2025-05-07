import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from "react-native";
import MapView, { LatLng, Marker, Polyline } from "react-native-maps";
import { getRoundTripRoute } from "./RoundTripRoutingAPI";
import polyline, { decode } from "polyline";
import { start } from "repl";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker"; 
import { StatusBar } from "expo-status-bar";
import { abort } from "process";
import Arrow from "@/icons/arrow";
import { getStartEndTrip } from "./StartEndTripRoutingAPI";
import{getRouteWithStops} from "./RoundTripLocations";
import MenuBar from "./menuBar";
import sendRouteDataHttpRequest from "./httpRequestClient";


interface MapProps {
    navigation:any
}

export const RoutewithDesScreen = (props:MapProps) => {

    const [route, setRoute] = useState<{latitude: number, longitude: number }[]>([]);
    const [endLocation, setEndLocation] = useState<{latitude: number; longitude: number} | null> (null);
    const [startLocation, setStartLocation] = useState<{latitude: number; longitude: number} | null> (null);
    const [distance, setDistance] = useState('500');
    const [optionExpand, setOptionExpand] = useState<boolean>(false);
    const pickerRef = useRef<Picker<string> | null>(null); 
    const [showStartText, setShowStartText] = useState<boolean>(true);
    const [geometry, setGeometry] = useState('');
    const [currentWalkData, setCurrentWalkData] = useState<JSON>();
    const [isSelectingLocation, setIsSelectingLocation] = useState(true);
    const [StartButtontext, setStartButtonText] = useState(true);
    const [isSelectingLocationEnd, setIsSelectingLocationEnd] = useState(false);
    const [EndButtontext, setEndButtonText] = useState(true);
    const [startChosen, setStartChosen] = useState(false);
    const [endChosen, setEndChosen] = useState(false);
    const [reset, setReset] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [containerColor, setContainerColor] = useState('rgba(7, 67, 11, 0.8)');
    const [WalkGenerated, setWalkGenerated]= useState<boolean>(false);
    const [menuExpand, setMenuExpand] = useState<boolean>(false);
    
    const toggleMenuExpander = () => setMenuExpand(prev => !prev);

    
    interface MapProps {
      navigation:any
  }

    const toggleOptionExpander = (props: MapProps) => setOptionExpand(prev => !prev);

    const fetchRouteStartDes = async () => {
    
        const start: {latitude: number; longitude: number} = {latitude: 59.8586 , longitude: 17.6450 }; 
        const end: {latitude: number; longitude: number} = {latitude: 59.861231, longitude: 17.627068}; 

        const result = await getStartEndTrip(startLocation, endLocation, 42, 3, 600);
        console.log("data is here:", result.routes[0]);

        const resultGeometry = result.routes[0].geometry;

        console.log("geo", result.routes[0].geometry);
        console.log("distance", result.routes[0].summary.distance);
        console.log("result", resultGeometry);

        const decodegeom = polyline.decode(resultGeometry);
        console.log("decode", decodegeom);
        const formattedRoute = decodegeom.map((coord: number[]) => ({
            latitude: coord[0],
            longitude: coord[1],
            }));

        console.log("here again", formattedRoute);
        setRoute(formattedRoute);
        setCurrentWalkData(result);
        setShowInfo(true);
    };

    const handlePress = (e: any) => {
      const coordinate = e.nativeEvent.coordinate;

      if (isSelectingLocation) {
        setStartLocation(coordinate);  
        setIsSelectingLocation(false);
        setStartButtonText(false);
        setStartChosen(true);
        handlePressColorContainer();
        setShowStartText(false);
    
        // Fördröj nästa steg lite för säkerhets skull
        setTimeout(() => {
          setIsSelectingLocationEnd(true);
        }, 100); // 100 ms räcker oftast
        return;
      }
    
      if (isSelectingLocationEnd) {
        setEndLocation(coordinate);
        setIsSelectingLocationEnd(false);
        setEndButtonText(false);
        setEndChosen(true);
        setReset(true);
        setMenuExpand(true);
      }
    };

    const handlePressColorContainer = () => {
      setContainerColor(containerColor === 'rgba(7, 67, 11, 0.8)'? "rgba(107, 21, 21, 0.8)" : 'rgba(7, 67, 11, 0.8)'); // Toggle between white and light blue
    };

        const sendRouteToBackend = async () => {
          console.log("send data");
          if(currentWalkData) {
            console.log("send data walk");
          //sendToBackend(ws, currentWalkData, 1); 
          sendRouteDataHttpRequest(currentWalkData, 1); // 1 = userID, placeholder
          }
        };

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

            onPress={(e) => {handlePress(e)
            }}
        >
            {startLocation && <Marker coordinate={startLocation} title="Start" pinColor="white"/>}
            {endLocation && <Marker coordinate={endLocation} title="Slut" pinColor="red" />}

            {/* Render the route on the map */}
            {route.length > 0 && <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" /> }
        </MapView> 

{isSelectingLocationEnd &&(
  <View style= {styles.messageContainer}>
    <Text style= {styles.startText}> Klicka på kartan för att välja en slutpunkt </Text>
  </View>
)}

<View style={styles.buttonContainer}>
        <Pressable style={styles.arrowButton} 
          onPress={toggleMenuExpander}>
          <Arrow width={36} height={36} angle={menuExpand} />
        </Pressable>

{menuExpand && (

            <View>
              <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <TouchableOpacity
                      style={styles.buttoncontainer}
                      onPress={() => {
                        if(startChosen && endChosen) {
                          fetchRouteStartDes();
                          setWalkGenerated(true);
                      }
                      else {
                          alert("Please choose a start and end point.")
                      }  
                      }}
                    >
                      <Text style={styles.buttonTextWhite}>   Generera   </Text>
                    </TouchableOpacity>
              
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={() => {
                        setStartLocation(null);
                        setEndLocation(null);
                        setStartChosen(false);
                        setEndChosen(false);
                        setIsSelectingLocation(true);       // <-- Aktivera startval igen
                        setIsSelectingLocationEnd(false);
                        setShowStartText(true);             // <-- Visa infotekst igen
                        setStartButtonText(true);
                        setEndButtonText(true);
                        setRoute([]);
                        setShowInfo(false);
                        setContainerColor('rgba(7, 67, 11, 0.8)');
                        setReset(false);
                      }}
                    >
                      <Text style={styles.buttonTextWhite}>Återställ</Text>
                    </TouchableOpacity>
              </View>

              {WalkGenerated && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.buttonSave}
                    onPress={sendRouteToBackend}>
                    <Text style={styles.buttonSaveText}>Spara rutt</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.buttonSave}>
                    <Text style={styles.buttonSaveText}>Information</Text>
                  </TouchableOpacity>
                </View>
                  )}
                </View>
            
  )}
  </View>

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
  optionsMenu: {
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
  generateButton: {
    backgroundColor: '#1B2D92',
    padding: 15,
    borderRadius: 20,
    margin: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 25,
    textAlign:'center',
    fontWeight: 'bold'
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
  buttonSave: {
    backgroundColor: "#E15F18",
    padding: 12,
    borderRadius: 30,
    width: "47.5%",
    margin: 5,
  },
  buttonTextWhite: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  mainButtons: {
    flexDirection: "row",

  },
  buttonRow: {
    flexDirection: "row",
  },
  buttonSaveText: {
    fontSize: 19,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  buttoncontainer: {
    padding: 15,
    margin: 15,
    backgroundColor: '#1B2D92',
    borderRadius: 30,
    borderColor: "black",
    color: "white",
    alignContent: "center",
    width: "55%",
},
arrowButton: {
  backgroundColor: "white",
  marginBottom: 10,
},
});
      
