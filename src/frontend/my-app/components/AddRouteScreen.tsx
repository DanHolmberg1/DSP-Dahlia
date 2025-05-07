import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { getRoundTripRoute, getRoundTripRouteSquare } from "./RoundTripRoutingAPI";
import polyline, { decode } from "polyline";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker"; 
import { StatusBar } from "expo-status-bar";
import Arrow from "@/icons/arrow";
import MenuBar from "./menuBar";
import * as Location from 'expo-location';
import { calculateSquare } from "./RoundRoutingAlgortihm";
interface BookingProps {
    navigation: any
    route: any
}

export const AddRoute = (props: BookingProps) => {

  const [route, setRoute] = useState<{longitude: number, latitude: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState();
  const [distance, setDistance] = useState('500');
  const [menuExpand, setMenuExpand] = useState<boolean>(false);
  const [startLocation, setStartLocation] = useState<{latitude: number; longitude: number} | null> (null);
  const pickerRef = useRef<Picker<string> | null>(null); 
  const [showStartText, setShowStartText] = useState<boolean>(true);
  const [ShowRoundTrip, setShowRoundTrip] = useState<boolean>(true);
  const [WalkGenerated, setWalkGenerated]= useState<boolean>(false);
  const [currentWalkData, setCurrentWalkData] = useState<JSON>();
  const [startChosen, setStartChosen] = useState(false);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  //const [region, setRegion] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState({ latitudeDelta: 0.05, longitudeDelta: 0.05 });
  const [region, setRegion] = useState<Region | undefined>(
    location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : undefined
  );

  const defaultRegion = { // Uppsala as deafult 
    latitude: 59.8586,
    longitude: 17.6450,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const [ShowinitialRegion, setShowInitialRegion] = useState(defaultRegion);

  const toggleMenuExpander = () => setMenuExpand(prev => !prev);

  useEffect(() => {
    let subscription: Location.LocationSubscription;
  
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        console.log(errorMsg);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,      // every 1 second
          distanceInterval: 1,     // or every 1 meter
        },
        (newLocation) => {
          setLocation(newLocation);
          console.log('Location:', newLocation.coords);
        }
      );
    };
  
    startTracking();
  
    return () => {
      if (subscription) subscription.remove(); // cleanup on unmount
    };
  }, []);

  useEffect(() => {
    if (location) {
      setShowInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05, 
        longitudeDelta: 0.05,
      });
    }
  }, [location]);

  // const initialRegion = location
  // ? {
  //     latitude: location.coords.latitude,
  //     longitude: location.coords.longitude,
  //     latitudeDelta: 0.05,
  //     longitudeDelta: 0.05,
  //   }
  // : defaultRegion;

  const fetchRoundTripRoute = async () => {
   
    setWalkGenerated(true);

    const randomSeed = Math.floor(Math.random()* 1000);
    const distanceNum = Number(distance);

    const squarePoints = calculateSquare(startLocation, distanceNum);

    //const result = await getRoundTripRoute(startLocation, distanceNum, randomSeed, 3);
    const result = await getRoundTripRouteSquare(squarePoints);

    setRouteInfo(result);
    const resultGeometry = result.routes[0].geometry;
    const decodegeom = polyline.decode(resultGeometry);

    console.log("distance", result.routes[0].summary.distance);

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
            initialRegion={ShowinitialRegion}
            // region={location ? {
            //   latitude: location.coords.latitude,
            //   longitude: location.coords.longitude,
            //   latitudeDelta: zoomLevel.latitudeDelta,
            //   longitudeDelta: zoomLevel.longitudeDelta,
            // } : undefined}  --> this tracks the user, maps follows

            onRegionChangeComplete={(newRegion) => {
              setZoomLevel({
                latitudeDelta: newRegion.latitudeDelta,
                longitudeDelta: newRegion.longitudeDelta
              });
              console.log("Zoom level updated:", newRegion.latitudeDelta, newRegion.longitudeDelta);
            }}
 
            onPress={(e) => {setStartLocation(e.nativeEvent.coordinate)
                setStartChosen(true);
            }}

        >
            {/* Render location on map*/}
            {location && (<Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} title="Du är här" pinColor="blue" />)}
            
            {/* Render the chosen start location*/}
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
      props.navigation.navigate("Skapa promenad", {selectedRoute: routeInfo, walkData: props.route.params.walkData});
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