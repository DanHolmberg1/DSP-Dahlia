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

const MapScreen = ({}) => {
    const [route, setRoute] = useState<{latitude: number, longitude: number }[]>([]);
    const [distance, setDistance] = useState('500');
    const [menuExpand, setMenuExpand] = useState<boolean>(false);
    const [startLocation, setStartLocation] = useState<{latitude: number; longitude: number} | null> (null);
    const distanceOptions = ['500', '700', '1000', '1500', '2000', '2500']
    const pointValues = [3, 4, 5];
    const pickerRef = useRef<Picker<string> | null>(null); 
    const [showStartText, setShowStartText] = useState<boolean>(true);

   // const map = () => props.navigation.navigate("home")
    const fetchRoute = async () => {
        const randomFactor = Math.random() + 1;
        const randomPoints = Math.floor(Math.random()* pointValues.length);
        const randomSeed = Math.floor(Math.random()* 1000);
        const distanceNum = Number(distance);
        
        const result = await getRoundTripRoute(startLocation, distanceNum, randomSeed, 3);

        const resultGeometry = result.geometry;

        console.log("result", resultGeometry);
            const decodegeom = polyline.decode(resultGeometry);
            console.log("decode", decodegeom);
            const formattedRoute = decodegeom.map((coord: number[]) => ({
                latitude: coord[0],
                longitude: coord[1],
              }));

            console.log("here again", formattedRoute);
            setRoute(formattedRoute);
      };

      const toggleMenuExpander = () => setMenuExpand(prev => !prev);


      const TestStartEnd = async () => {

        const start: {latitude: number; longitude: number} = {latitude: 59.8586 , longitude: 17.6450 }; 
        const end: {latitude: number; longitude: number} = {latitude: 59.8580 , longitude: 17.6326 }; 

        const result = await getStartEndTrip(start, end, 42, 3 );

        const resultGeometry = result.geometry;
        console.log("distance", result.summary.distance);

        console.log("result", resultGeometry);
            const decodegeom = polyline.decode(resultGeometry);
            console.log("decode", decodegeom);
            const formattedRoute = decodegeom.map((coord: number[]) => ({
                latitude: coord[0],
                longitude: coord[1],
              }));

            console.log("here again", formattedRoute);
            setRoute(formattedRoute);
      };
     
    return (

      <View style={styles.container}>

{showStartText && (
    <View style={styles.messageContainer}> 
        <Text style={styles.startText}> Click on screen to choose start point </Text>
    </View>  )} 
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 59.8586, // Example center (Uppsala)
            longitude: 17.6450,
            latitudeDelta: 0.05, // Zoom level
            longitudeDelta: 0.05,
          }}

          onPress={(e) => {setStartLocation(e.nativeEvent.coordinate)
            setShowStartText(false);
           }}
        >
        {startLocation && <Marker coordinate={startLocation} title="Start"/>}

          {/* Render the route on the map */}
          {route.length > 0 && <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" /> }
        </MapView>
            
<View style={{alignItems: 'center', width: "100%" , backgroundColor: 'rgba(7, 39, 14, 0.8)',   justifyContent: "center", flexDirection: "column", position: "absolute", bottom: 0}}>


<Button title = "start end route" onPress={TestStartEnd}/>
<View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", position: "relative"}}> 
<Text style={[styles.inputLable, {marginBottom: menuExpand ? 20 : 40}]}> Choose route length</Text>

<Pressable style={{marginLeft: "auto", marginRight: 25, zIndex: 20, position: "absolute", right: 0}}  onPress={toggleMenuExpander} >
<Arrow width={36} height={36} angle={menuExpand}/>
</Pressable>
</View>

    {menuExpand && (
    <Picker
    ref = {pickerRef}
    selectedValue= {distance}
    onValueChange={(distanceValue)=>{
        setDistance(distanceValue)
    }}
    style = {{width:'50%', backgroundColor: "rgba(7, 39, 14, 0.8)",  borderRadius: 30, height: 200, marginBottom: 90}}
    mode="dropdown"
    >
    
    <Picker.Item label='500 meters' value ={'500'} />
    <Picker.Item label='1km' value ={'1000'} />
    <Picker.Item label='1,5km' value ={'1500'} />
    <Picker.Item label='2km' value ={'2000'} />
    <Picker.Item label='2.5km' value ={'2500'} />
    <Picker.Item label='3km' value ={'3000'} />
    <Picker.Item label='3.5km' value ={'3500'} />
    <Picker.Item label='4km' value ={'4000'} />
    <Picker.Item label='4.5km' value ={'4500'} />
    <Picker.Item label='5km' value ={'5000'} />
    </Picker>
    )}
</View> 

        {menuExpand && (
    <View style={{width: "100%", alignItems: "center", justifyContent: "center"}}> 
     <View style={styles.buttoncontainer}>
        <Button    title="Generate Route" onPress={fetchRoute} />
        </View> 
        </View>
              )}
      </View>
    );
  };
  
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
        backgroundColor: 'rgba(7, 39, 14, 0.8)',
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

    buttoncontainer: {
        width: "50%",
        marginBottom: 40,
        backgroundColor: 'white',
        position: "absolute",
        bottom: 0,
        borderRadius: 30,
        borderColor: "black",
        color: "black"
    },

    startText: {
        fontSize: 22,
        color:"white",
        marginBottom: 10,
        marginTop: 20,
        marginLeft: 0,
    },
  });
  
  export default MapScreen;