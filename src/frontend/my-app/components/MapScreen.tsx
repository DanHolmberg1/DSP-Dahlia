import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoundTripRoute } from "./RoutingAPI";
import polyline, { decode } from "polyline";
import { start } from "repl";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker"; 
import { StatusBar } from "expo-status-bar";
import { abort } from "process";
import Arrow from "@/icons/arrow";


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
        //const start = { latitude: 59.8586, longitude: 17.6450}; // Example starting point (Berlin)
        const randomFactor = Math.random() + 1;
        const randomPoints = Math.floor(Math.random()* pointValues.length);
        const randomSeed = Math.floor(Math.random()* 1000);
        const distanceNum = Number(distance);
        //setDistance('');
        const result = await getRoundTripRoute(startLocation, distanceNum, randomSeed, 3);

        console.log("result", result);
            const decodegeom = polyline.decode(result);
            console.log("decode", decodegeom);
            const formattedRoute = decodegeom.map((coord: number[]) => ({
                latitude: coord[0],
                longitude: coord[1],
              }));

            console.log("here again", formattedRoute);
            setRoute(formattedRoute);
      };

      const toggleMenuExpander = () => setMenuExpand(prev => !prev);
    
    // useEffect(() => {
    //   fetchRoute();
    // }, [startLocation, distance]); 
  
    return (

      <View style={styles.container}>

{showStartText && (
    <View style={{backgroundColor: 'rgba(7, 39, 14, 0.8)'}}> 
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
    </Picker>
    )}
</View> 


        {/* <View style={styles.controls}/>
        <Text style={styles.inputLable}> Enter route length (meters) </Text>

        <TextInput
        
        style = {styles.input}
        keyboardType="numeric"
        value={distance.toString()}
        onChangeText={(text) =>  {
            const validNum = Number(text);
            if(validNum > 0 && validNum < 1000000) {
                setDistance(text);
                console.log(validNum);
            } else {
                console.log('Invalid number');
            }
        }}
            
        placeholder="Enter distance (meters) "
        /> */}

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
        marginBottom: 50,
        marginTop: 80,
        marginLeft: 20,
        

    },
  });
  
  export default MapScreen;