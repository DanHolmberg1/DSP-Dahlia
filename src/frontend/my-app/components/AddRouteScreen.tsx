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
import MenuBar from "./menuBar";
interface BookingProps {
    navigation: any
    route: any
}

export const AddRoute = (props: BookingProps) => {

  const [route, setRoute] = useState<{longitude: number, latitude: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState();
  const [distance, setDistance] = useState('500');
  const [menuExpand, setMenuExpand] = useState<boolean>(false);
  const [optionExpand, setOptionExpand] = useState<boolean>(false);
  const [startLocation, setStartLocation] = useState<{latitude: number; longitude: number} | null> (null);
  const pickerRef = useRef<Picker<string> | null>(null); 
  const [showStartText, setShowStartText] = useState<boolean>(true);
  const [ShowRoundTrip, setShowRoundTrip] = useState<boolean>(true);
  const [ShowOptions, setShowOptions] = useState<boolean>(false);
  const [HasShowOptions, setHasShowOptions] = useState<boolean>(false);
  const [WalkGenerated, setWalkGenerated]= useState<boolean>(false);
  const [currentWalkData, setCurrentWalkData] = useState<JSON>();
  const [startChosen, setStartChosen] = useState(false);

  const toggleMenuExpander = () => setMenuExpand(prev => !prev);

  const fetchRoundTripRoute = async () => {
   
    setWalkGenerated(true);

      const randomSeed = Math.floor(Math.random()* 1000);
      const distanceNum = Number(distance);

    
      const result = await getRoundTripRoute(startLocation, distanceNum, randomSeed, 3);
      setRouteInfo(result);
      const resultGeometry = result.routes[0].geometry;
      console.log("geo: ", resultGeometry);
     
          const decodegeom = polyline.decode(resultGeometry);
        
          const formattedRoute = decodegeom.map((coord: number[]) => ({
              latitude: coord[0],
              longitude: coord[1],
            }));

          setRoute(formattedRoute);
          setCurrentWalkData(result);
    };


return (

    
<View style={styles.container}>

    {showStartText && (
        <View style={styles.messageContainer}> 
            <Text style={styles.startText}> Klicka på kartan för att bestämma start punkt </Text> 
        </View>  )} 
    <MapView
            style={styles.map}
            initialRegion={{
            latitude: 59.8586, //Example center (Uppsala) TODO: is it possible to change the start screen based on user location?
            longitude: 17.6450,
            latitudeDelta: 0.05, 
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


<View style={{alignItems: "center", display: "flex", justifyContent: "center", width: "100%"}}>

<TouchableOpacity 
  style={[styles.savebuttoncontainer]} 
  onPress={() => {
    if (!startLocation || !routeInfo) {
      alert("Välj en startpunkt/sträcka.");
    } else {
      props.navigation.navigate("Skapa promenad", {selectedRoute: routeInfo});
    }
  }}
>
  <Text style={[styles.buttonTextBlue]}>Spara och gå tillbaka</Text>
  </TouchableOpacity>


</View>

{ShowRoundTrip && (

<View style={{alignItems: 'center', width: "100%" , backgroundColor: 'white',   justifyContent: "center", flexDirection: "column", position: "absolute", bottom: 0}}>

<View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", position: "relative"}}> 
<Text style={[styles.inputLable, {marginBottom: menuExpand ? 20 : 40}]}> Välj distans</Text>

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
<Picker.Item label='500 meter' value ={'500'} />
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
  style={[styles.buttoncontainer, {marginRight: Platform.OS === 'android' ? 15 : 0}]} 
  onPress={() => {
    if (!startChosen) {
      alert("Välj en startpunkt.");
    } else {
      fetchRoundTripRoute();
    }
  }}
>
  <Text style={[styles.buttonTextWhite, {marginLeft: Platform.OS === 'android' ? -13: 25}]}>Generera</Text>
  </TouchableOpacity>

    </View> 
    </View>
  )}

</View>
  
)};

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
    fontSize: 22,
    color:"#007bff",
    marginBottom: 50,
    marginTop: 20,
},

buttoncontainer: {
    width: "70%",
    marginBottom: 40,
    backgroundColor: '#1B2D92',
    position: "absolute",
    bottom: -8,
    borderRadius: 30,
    borderColor: "black",
    color: "white",
    right: -140,
    height: 50,
},

savebuttoncontainer: {

  alignItems: "center",
  justifyContent: "center",
  marginBottom: 90,
  backgroundColor: 'white',
  position: "absolute",
  padding: 20,
  bottom: 0,
  left: 5,
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

buttonTextBlue: {
    color: "blue",
    fontSize: 22,
  },

}); export default AddRoute;