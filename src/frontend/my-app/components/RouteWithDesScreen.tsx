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
      }
    };

    const handlePressColorContainer = () => {
      setContainerColor(containerColor === 'rgba(7, 67, 11, 0.8)'? "rgba(107, 21, 21, 0.8)" : 'rgba(7, 67, 11, 0.8)'); // Toggle between white and light blue
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

    <View style= {styles.OptionsMenu}>
            <View style={styles.buttonContainer}>

              <TouchableOpacity style={[styles.generateButton]}
                            onPress={() => {
                    if(startChosen && endChosen) {
                        fetchRouteStartDes();
                    }
                    else {
                        alert("Please choose a start and end point.")
                    }  
                }}>
              <Text style={[styles.buttonText]}>Generera rutt</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetButton}
                // add some styling!
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
                <Text style={[styles.buttonText]}>Återställ</Text>
              </TouchableOpacity>
          </View>

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
  OptionsMenu: {
    position: 'absolute',  // Position container absolutely relative to the screen
    bottom: 0,             // Align it to the bottom of the screen
    height: "30%",  // Set the container's height to 40% of the screen height
    width: '100%',         // Make the container take the full width
    backgroundColor: 'white',  // Background color for visibility
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
  },
  generateButton: {
    backgroundColor: '#E15F18',
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
    padding: 15,
    borderRadius: 20,
    margin: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    bottom: 57,
  },
});
      
