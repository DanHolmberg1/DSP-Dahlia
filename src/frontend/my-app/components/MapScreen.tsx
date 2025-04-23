import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
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
import { RoundRouteScreen } from "./RoundRouteScreen";
import MenuBar from "./menuBar";


interface MapProps {
  navigation: any
}

const MapScreen = (props: MapProps) => {

    const [menuExpand, setMenuExpand] = useState<boolean>(false);
    const [optionExpand, setOptionExpand] = useState<boolean>(true);
    const [startLocation, setStartLocation] = useState<{latitude: number; longitude: number} | null> (null);
    const pickerRef = useRef<Picker<string> | null>(null); 
    const [showStartText, setShowStartText] = useState<boolean>(true);
    const [ShowOptions, setShowOptions] = useState<boolean>(true);
    const [HasShowOptions, setHasShowOptions] = useState<boolean>(false);

    const toggleOptionExpander = () => setOptionExpand(prev => !prev);

    return (

<View style={styles.container}>


{showStartText && (
    <View style={styles.messageContainer}> 
   
    </View>  )} 
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 59.8586, //Example center (Uppsala) TODO: is it possible to change the start screen based on user location?
            longitude: 17.6450,
            latitudeDelta: 0.05, // Zoom level
            longitudeDelta: 0.05,
          }}

          onPress={(e) => {setStartLocation(e.nativeEvent.coordinate)
            setShowStartText(false);
            if(!HasShowOptions) {
            setShowOptions(true);
            setHasShowOptions(true);
            }
            console.log('ShowOptions:', ShowOptions);
           }}
        >
          {startLocation && <Marker coordinate={startLocation} title="Start"/>}

        </MapView>
        <View style={{ marginRight: Platform.OS === 'android' ? -30: 0 }}>
  <TouchableOpacity 
    style={styles.saveButtonContainer} 
    onPress={() => props.navigation.navigate("Saved routes")}
  >
    <Text style={styles.savedRouteText}>Sparade rutter</Text>
  </TouchableOpacity>
</View>

    {ShowOptions && (
    <View style={[styles.OptionContainer, {paddingTop: Platform.OS === 'android' ? 10: 20}, {height: optionExpand ? '15%': '9%'}]}>
      {!optionExpand && (
        <Text style = {[styles.OptionStartText, { marginBlockStart: Platform.OS === 'android' ? 20 : 0 }]}> Designa din promenad</Text>
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
      <Button title="Walk with stops" onPress={() =>  props.navigation.navigate("Walk with stops")
      }/>
      </View> 
      </View>
        
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

    saveButtonContainer: {
      width: "45%",
      marginBottom: 0,
      backgroundColor: '#E15F18',
      position: "absolute",
      bottom: 140,
      borderRadius: 30,
      borderColor: "white",
      color: "black",
      left: 10,
      padding: 10,

    },

    savedRouteText: {
      color: "#fff",
      fontSize: 22,
      left: 20,
      marginTop: 0,
    },

    OptionContainer: {
      flex: 1,
      backgroundColor:'#1B2D92',
      padding: 20,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      zIndex: 10,
      position: 'absolute', // Keeps it positioned relative to the screen
      top: 0,  // Move to the top instead of bottom
      width: '100%', 
      marginBottom: 0, // Remove margin to avoid gaps
    },

    OptionStartText: {
      fontSize: 22,
      color: "white",
      marginTop: 0,  // Remove any margin from the top
      //marginBottom: 0,  // Remove margin at the bottom if you want to keep it tight
      textAlign: 'left',  // Align the text to the left
      overflow: 'visible',
      justifyContent: 'center',
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

});
  
  export default MapScreen;