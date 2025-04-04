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
    const [ShowRoundTrip, setShowRoundTrip] = useState<boolean>(false);
    const [ShowtripWithDes, setShowTripWitDes] = useState<boolean>(false);
    const [ShowtripWitStops, setShowTripWihStops] = useState<boolean>(false);
    const [ShowOptions, setShowOptions] = useState<boolean>(false);
    const [HasShowOptions, setHasShowOptions] = useState<boolean>(false);
    const [WalkGenerated, setWalkGenerated]= useState<boolean>(false);
    const [currentWalkData, setCurrentWalkData] = useState<JSON>();
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [StartButtontext, setStartButtonText] = useState(true);
    const [isSelectingLocationEnd, setIsSelectingLocationEnd] = useState(false);
    const [EndButtontext, setEndButtonText] = useState(true);
    const [SettingLocation, setSettingLocation] = useState(false);
    const [startChosen, setStartChosen] = useState(false);
    const [endChosen, setEndChosen] = useState(false);
    const [buttontext, setButtontext] = useState(false);
    const [reset, setReset] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [containerColor, setContainerColor] = useState('rgba(106, 191, 112, 0.8)');
    
   
    const toggleOptionExpander = () => setOptionExpand(prev => !prev);

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

    // Function to handle the map press event
    const handlePress = (e: any) => {
      if(isSelectingLocation) {  // Only allow selecting location if button has been pressed
        const coordinate = e.nativeEvent.coordinate;
        setStartLocation(coordinate);  // Save the coordinates as the start location
        setIsSelectingLocation(false);// Disable map press after location is set
        setStartButtonText(false);
        setStartChosen(true);
        setButtontext(true);
        handlePressColorContainer();
      }

      if(isSelectingLocationEnd) {
        const coordinate = e.nativeEvent.coordinate;
        setEndLocation(coordinate);
        setIsSelectingLocationEnd(false);
        setEndButtonText(false);
        setEndChosen(true);
        setReset(true);
      }
    }

    const handlePressColorContainer = () => {
      setContainerColor(containerColor === "rgba(106, 191, 112, 0.8)" ? "rgba(224, 151, 151, 0.8)" : "rgba(106, 191, 112, 0.8)"); // Toggle between white and light blue
    };


    const handleSetStartLocation = () => {
    setIsSelectingLocation(true);  // Allow map press to select a location
    }

    const handleSetEndLocation = () => {
        setIsSelectingLocationEnd(true);  // Allow map press to select a location
    }

    return ( 

        <View style={styles.container}>

        <MapView
            style={styles.map}
            initialRegion={{
            latitude: 59.8586, //Example center (Uppsala) TODO: is it possible to change the start screen based on user location?
            longitude: 17.6450,
            latitudeDelta: 0.05, // Zoom level
            longitudeDelta: 0.05,
            }}

            onPress={handlePress}

            // onPress={(e) => {setStartLocation(e.nativeEvent.coordinate)
            // setShowStartText(false);
            // if(!HasShowOptions) {
            // setShowOptions(true);
            // setHasShowOptions(true);
            // }
            // console.log('ShowOptions:', ShowOptions);
            // }}
        >
            {startLocation && <Marker coordinate={startLocation} title="Start" pinColor="green"/>}
            {endLocation && <Marker coordinate={endLocation} title="End" pinColor="red"/>}
            {/* Render the route on the map */}
            {route.length > 0 && <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" /> }
        </MapView> 

    {ShowOptions && (
        <View style={[styles.OptionContainer, {height: optionExpand ? '15%': '9%'}]}>
        {!optionExpand && (
            <Text style = {styles.OptionStartText}> Desing your walk</Text>
        )}
      <View style={{ 
      flexDirection: "row", 
      width: "100%", 
      alignItems: "center", 
      justifyContent: "center", 
      position: "relative",
      marginTop: 60
    }}> 
      <Pressable style={{
        marginLeft: "auto", 
        marginRight: 20, 
        zIndex: 20, 
        position: "absolute", 
        right: 0,
        paddingBottom: optionExpand ? 5 : 135,}}  
        onPress={toggleOptionExpander} >
      <Arrow width={36} height={36} angle={optionExpand}/>
      </Pressable>
      </View>

      {optionExpand && (
      <View>
      <View style= {[styles.buttoncontainerRoundTrip]}>
      <Button title="Round walk" onPress={() => props.navigation.navigate("Round walk")
      }/> 
      </View> 

      <View style= {[styles.buttoncontainerTripWithDes]}>
      <Button title="Walk with destination" onPress={() => props.navigation.navigate("Walk with destination")
      }/>
      </View> 

      <View style= {[styles.buttoncontainerTripWithStops]}>
      <Button title="Walk with stops" onPress={() => {
      setShowTripWihStops(true);
      setShowRoundTrip(false);
      setShowTripWitDes(false);
      }}/>
      </View> 
      </View>
        
    )}
    </View>
  )}

{isSelectingLocation &&(
  <View style= {styles.messageContainer}>
    <Text style= {styles.startText}> Choose start point by clicking on the map </Text>
  </View>
)}

{isSelectingLocationEnd &&(
  <View style= {styles.messageContainer}>
    <Text style= {styles.startText}> Choose end point by clicking on the map </Text>
  </View>
)}

<View style= {styles.OptionsMenu}>

    <View style={styles.locationContainer}>
        <View style={[styles.buttoncontainerStart, {backgroundColor: containerColor}]}>
            <Button title= {buttontext ? "Press to choose end point" : 'Press to choose start point'} onPress={() => {
              
              if(!startChosen) {
                handleSetStartLocation();
                
                
              }
              else {
                handleSetEndLocation();
              }
            }} />
        </View>

        {reset && (
                <View style={styles.buttoncontainerReset}>
                <Button title= "reset" onPress={() => {
                  setButtontext(false);
                  setStartLocation(null),
                  setEndLocation(null);
                  setStartChosen(false);
                  setEndChosen(false);
                  setIsSelectingLocation(false),
                  setIsSelectingLocationEnd(false);
                  setRoute([]);
                  setShowInfo(false);
                  setContainerColor("rgba(106, 191, 112, 0.8)")
                  //setReset(false);
                  
                }} />
            </View>
        )}


  
    </View>

    <View style = {styles.buttoncontainer}>
        <Button title="Generate route" onPress={() => {
            if(startChosen && endChosen) {
                fetchRouteStartDes();
            }
            else {
                alert("Please choose a start and end point.")
            }  
        }}/>
    </View>

    {showInfo && (

      <View style = {styles.buttoncontainerInfo}>
        <Button title="Show info"/>

      </View>
    )}

</View>  

</View>     
)}

    const styles = StyleSheet.create({
        container: { flex: 1 },
        map: { flex: 1 },
        controls: {
            position: "absolute",
            bottom: 0,
            width:"100%",
            height:"30%",
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            padding: 20,
            justifyContent:"center",
            alignItems:"center",
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
        inputLable: {
            fontSize: 22,
            color:"white",
            marginBottom: 50,
            marginTop: 20,
        
        },
        input: {
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: 20,
            paddingLeft: 8,
            backgroundColor: "white", // Set background color for the input field
            color: "black",
            width: "100%", // Make input take the full width
        },
        buttoncontainerStart: {
            width: "200%",           // The width of the button container
            backgroundColor: 'white',  // Background color of the container
            position: "absolute",   // Position the container absolutely
            top: 30,                 // Align the container to the top of the screen
            left: 10,                // Align the container to the left side of the screen
            borderRadius: 20,       // Rounded corners for the button container
            borderColor: "black",   // Border color for the button container
            borderWidth: 1,         // Set border width if needed
            padding: 10,            // Padding for better visual appearance
            color: "black",         // Text color (though the button text color will be separate)
          },

          buttoncontainer: {
            width: "60%",
            marginBottom: 35,
            backgroundColor: 'rgba(3, 11, 54, 0.96)',
            position: "absolute",
            bottom: 15,
            padding: 10,
            borderRadius: 30,
            borderColor: "black",
            color: "black"
        },

          buttoncontainerReset: {
            width: "90%",           // The width of the button container
            backgroundColor: 'white',  // Background color of the container
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
          buttoncontainerInfo: {
            width: "40%",           // The width of the button container
            backgroundColor: 'white',  // Background color of the container
            position: "absolute",   // Position the container absolutely
            top: 180,                 // Align the container to the top of the screen
            left: 210,                // Align the container to the left side of the screen
            borderRadius: 20,       // Rounded corners for the button container
            borderColor: "black",   // Border color for the button container
            borderWidth: 1,         // Set border width if needed
            padding:0,            // Padding for better visual appearance
            color: "black", 
            height: 40,        // Text color (though the button text color will be separate)
          },
    
        savebuttoncontainer: {
          width: "50%",
          marginBottom: 90,
          backgroundColor: 'white',
          position: "absolute",
          bottom: 0,
          borderRadius: 30,
          borderColor: "black",
          color: "black"
        },
    
        startText: {
            fontSize: 20,
            color:"white",
            marginBottom: 10,
            marginTop: 20,
            marginLeft: 0,
        },
        OptionContainer: {
          flex: 1,
          backgroundColor: 'rgba(6, 18, 87, 0.8)',
          padding: 20,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          zIndex: 10,
          position: 'absolute', // Keeps it positioned relative to the screen
          top: 0,  // Move to the top instead of bottom
          width: '100%', 
          marginBottom: 0, // Remove margin to avoid gaps
        },

        innerContainer: {
            width: '80%', // 80% of parent width
            height: '50%', // 50% of parent height
            backgroundColor: 'white', // White inner container
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20, // Rounded corners
            shadowColor: '#000', // Shadow for depth
            shadowOpacity: 0.2,
            shadowOffset: { width: 2, height: 2 },
            elevation: 5, // Android shadow
          },
        OptionStartText: {
          fontSize: 10,
          color: "white",
          marginTop: 0,  // Remove any margin from the top
          marginBottom: 0,  // Remove margin at the bottom if you want to keep it tight
          textAlign: 'left',  // Align the text to the left
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
        buttoncontainerTripWithDes: {
          width: "60%",
          marginBottom: -20,
          backgroundColor: 'white',
          position: "absolute",
          bottom: 0,
          borderRadius: 30,
          borderColor: "white",
          color: "black",
          left: -5,
        },
        buttoncontainerTripWithStops: {
          width: "60%",
          marginBottom: 30,
          marginLeft: 150,
          backgroundColor: 'white',
          position: "absolute",
          bottom: 0,
          borderRadius: 30,
          borderColor: "white",
          color: "black",
          left: -5,
        },
    
        OptionsMenu: {
            position: 'absolute',  // Position container absolutely relative to the screen
            bottom: 0,             // Align it to the bottom of the screen
            height: "50%",  // Set the container's height to 40% of the screen height
            width: '100%',         // Make the container take the full width
            backgroundColor: 'white',  // Background color for visibility
            justifyContent: 'center', // Center the content vertically
            alignItems: 'center', // Center the content horizontally
            padding: 0,          // Add some padding for the content
        },
        centerButtonContainer: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: 150,
          zIndex: 10,
      },

      locationContainer: {
        position: "absolute",
        top: 50, // Adjust as needed
        left: 5,
        right: 5,
        backgroundColor: "rgba(255, 255, 255, 0.69)", // Semi-transparent background
        padding: 100,
        borderRadius: 15,
        borderColor: "rgba(3, 11, 54, 0.96)",
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "space-around",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
      },
    });
      
