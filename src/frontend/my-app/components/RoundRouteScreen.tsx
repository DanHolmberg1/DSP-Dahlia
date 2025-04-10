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
import { ws, sendToBackend } from "./webSocketsClient";
import sendRouteDataHttpRequest from "./httpRequestClient";
import { RoundRouting, calulateCircle } from "./RoundRoutingAlgortihm";
import { all } from "axios";


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
  const [ShowRoundTrip, setShowRoundTrip] = useState<boolean>(true);
  const [ShowtripWithDes, setShowTripWitDes] = useState<boolean>(false);
  const [ShowtripWitStops, setShowTripWihStops] = useState<boolean>(false);
  const [ShowOptions, setShowOptions] = useState<boolean>(false);
  const [HasShowOptions, setHasShowOptions] = useState<boolean>(false);
  const [WalkGenerated, setWalkGenerated]= useState<boolean>(false);
  const [currentWalkData, setCurrentWalkData] = useState<JSON>();
  const [startChosen, setStartChosen] = useState(false);

  const toggleMenuExpander = () => setMenuExpand(prev => !prev);

  const fetchRoundTripRoute = async () => {
    console.log("herre");
    setWalkGenerated(true);
      const randomFactor = Math.random() + 1;
      const randomPoints = Math.floor(Math.random()* pointValues.length);
      const randomSeed = Math.floor(Math.random()* 1000);
      const distanceNum = Number(distance);

      const Allpoints = calulateCircle(startLocation, Number(distance), 36);

      console.log('hereeee');

      console.log("points", Allpoints);
      
      const result = await getRoundTripRoute(startLocation, distanceNum, randomSeed, 3);
      const resultGeometry = result.routes[0].geometry;
      console.log("geo: ", resultGeometry);
     
          const decodegeom = polyline.decode(resultGeometry);

          console.log("decode geo ", decodegeom);
        
          const formattedRoute = decodegeom.map((coord: number[]) => ({
              latitude: coord[0],
              longitude: coord[1],
            }));

          setRoute(formattedRoute);
          setCurrentWalkData(result);
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

    {showStartText && (
        <View style={styles.messageContainer}> 
            <Text style={styles.startText}> Click on screen to choose start point </Text> 
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
                setStartChosen(true);

            console.log('ShowOptions:', ShowOptions);
            }}
        >
            {startLocation && <Marker coordinate={startLocation} title="Start" pinColor="white"/>}
            {/* Render the route on the map */}
            {route.length > 0 && <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" /> }
        </MapView> 

{ShowRoundTrip && (

<View style={{alignItems: 'center', width: "100%" , backgroundColor: 'white',   justifyContent: "center", flexDirection: "column", position: "absolute", bottom: 0}}>

<View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", position: "relative"}}> 
<Text style={[styles.inputLable, {marginBottom: menuExpand ? 20 : 40}]}> Choose route length</Text>

<Pressable style={{marginLeft: "auto", marginRight: 25, zIndex: 20, position: "absolute", right: 0, backgroundColor: "white"}}  onPress={toggleMenuExpander} >
<Arrow width={36} height={36} angle={menuExpand}/>
</Pressable>
</View>

{menuExpand && (
<Picker
ref = {pickerRef}
selectedValue= {distance}
onValueChange={(distanceValue)=> {
    setDistance(distanceValue)
}}
style = {{width:'50%', backgroundColor: "#007bff",  borderRadius: 30, height: 200, marginBottom: 90}}
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
)}
{menuExpand && (
<View style={{width: "100%", alignItems: "center", justifyContent: "center"}}> 
  <View>
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
  <Text style={styles.buttonTextWhite}>Generate Route</Text>
  </TouchableOpacity>

    </View> 
    </View>
  )}

{WalkGenerated && (
<View style = {styles.savebuttoncontainer}>
<Button title = "Save route" onPress={sendRouteToBackend}/>
</View>
)}

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
inputLable: {
    fontSize: 22,
    color:"#007bff",
    marginBottom: 50,
    marginTop: 20,
},

buttoncontainer: {
    width: "70%",
    marginBottom: 40,
    backgroundColor: 'rgba(3, 11, 54, 0.96)',
    position: "absolute",
    bottom: -8,
    borderRadius: 30,
    borderColor: "black",
    color: "white",
    right: -140,
    height: 50,
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
    fontSize: 22,
    color:"white",
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 0,
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
  left: 65,
 marginTop: 10,

},

});