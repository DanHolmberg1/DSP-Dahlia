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

export const RouteWithDesScreen = (props:MapProps) => {
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
    const [routeDistance, setRouteDistance] = useState<number | null>(null);
   
    const toggleOptionExpander = () => setOptionExpand(prev => !prev);
    const [hasRouteInfo, setHasRouteInfo] = useState(false);
    const fetchRouteStartDes = async () => {
        try {
            if (!startLocation || !endLocation) {
                alert("Please select both start and end locations");
                return;
            }
    
            const result = await getStartEndTrip(startLocation, endLocation, 42, 3, 600);
            
            if (!result || !result.geometry) {
                alert("No route found between these points");
                return;
            }
    
            const decodegeom = polyline.decode(result.geometry);
            const formattedRoute = decodegeom.map((coord: number[]) => ({
                latitude: coord[0],
                longitude: coord[1],
            }));
    
            setRoute(formattedRoute);
            setRouteDistance(result.summary.distance);
            setHasRouteInfo(true);  // Ny state för att indikera att vi har info
        } catch (error) {
            alert("Failed to generate route. Please try again.");
        }
    };

    const handlePress = (e: any) => {
      if(isSelectingLocation) {  
        const coordinate = e.nativeEvent.coordinate;
        setStartLocation(coordinate);  
        setIsSelectingLocation(false);
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
      setContainerColor(containerColor === "rgba(106, 191, 112, 0.8)" ? "rgba(224, 151, 151, 0.8)" : "rgba(106, 191, 112, 0.8)");
    };

    const handleSetStartLocation = () => {
        setIsSelectingLocation(true);
    }

    const handleSetEndLocation = () => {
        setIsSelectingLocationEnd(true);
    }

    return ( 
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                latitude: 59.8586,
                longitude: 17.6450,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
                }}
                onPress={handlePress}>
                {startLocation && <Marker coordinate={startLocation} title="Start" pinColor="green"/>}
                {endLocation && <Marker coordinate={endLocation} title="End" pinColor="red"/>}
                {route.length > 0 && <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" /> }
            </MapView> 

            {isSelectingLocation && (
                <View style= {styles.messageContainer}>
                    <Text style= {styles.startText}> Choose start point by clicking on the map </Text>
                </View>
            )}

            {isSelectingLocationEnd && (
                <View style= {styles.messageContainer}>
                    <Text style= {styles.startText}> Choose end point by clicking on the map </Text>
                </View>
            )}

{showInfo && (
    <View style={styles.infoBox}>
        <Text style={styles.infoText}>
            {routeDistance !== null ? (routeDistance / 1000).toFixed(2) + " km" : "Distance not available"}
        </Text>
        <Button 
            title="Close" 
            onPress={() => setShowInfo(false)} 
            color="#061257"
        />
    </View>
)}

            <View style= {styles.OptionsMenu}>
                <View style={styles.locationContainer}>
                    <View style={[styles.buttoncontainerStart, {backgroundColor: containerColor}]}>
                        <Button 
                            title= {buttontext ? "Press to choose end point" : 'Press to choose start point'} 
                            onPress={() => {
                                if(!startChosen) {
                                    handleSetStartLocation();
                                }
                                else {
                                    handleSetEndLocation();
                                }
                            }} 
                        />
                    </View>

                    {reset && (
                        <View style={styles.buttoncontainerReset}>
                            <Button 
                                title= "Reset" 
                                onPress={() => {
                                    setButtontext(false);
                                    setStartLocation(null),
                                    setEndLocation(null);
                                    setStartChosen(false);
                                    setEndChosen(false);
                                    setIsSelectingLocation(false),
                                    setIsSelectingLocationEnd(false);
                                    setRoute([]);
                                    setShowInfo(false);
                                    setContainerColor("rgba(106, 191, 112, 0.8)");
                                }} 
                            />
                        </View>
                    )}
                </View>

                <View style = {styles.buttoncontainer}>
                    <Button 
                        title="Generate route" 
                        onPress={() => {
                            if(startChosen && endChosen) {
                                fetchRouteStartDes();
                            }
                            else {
                                alert("Please choose a start and end point.")
                            }  
                        }}
                    />
                </View>

                {hasRouteInfo && (
    <View style={styles.buttoncontainerInfo}>
        <Button 
            title="Show Route Info" 
            onPress={() => setShowInfo(true)}
            color="#061257"
        />
    </View>
)}
            </View>  
        </View>     
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },

    messageContainer: {
        backgroundColor: 'rgba(6, 18, 87, 0.8)',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },

    buttoncontainerStart: {
        width: "200%",
        backgroundColor: 'white',
        position: "absolute",
        top: 30,
        left: 10,
        borderRadius: 20,
        borderColor: "black",
        borderWidth: 1,
        padding: 10,
        color: "black",
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
        width: "90%",
        backgroundColor: 'white',
        position: "absolute",
        top: 130,
        left: 15,
        borderRadius: 20,
        borderColor: "black",
        borderWidth: 1,
        padding:0,
        color: "black", 
        height: 40,
    },
    
    buttoncontainerInfo: {
        width: "40%",
        backgroundColor: 'white',
        position: "absolute",
        top: 180,
        left: 210,
        borderRadius: 20,
        borderColor: "black",
        borderWidth: 1,
        padding:0,
        color: "black", 
        height: 40,
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

    innerContainer: {
        width: '80%',
        height: '50%',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 2, height: 2 },
        elevation: 5,
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
    
    OptionsMenu: {
        position: 'absolute',
        bottom: 0,
        height: "50%",
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
    },

    locationContainer: {
        position: "absolute",
        top: 50,
        left: 5,
        right: 5,
        backgroundColor: "rgba(255, 255, 255, 0.69)",
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
        elevation: 5,
    },
    
    infoBox: {
        position: 'absolute',
        top: '30%',
        left: '20%',
        right: '20%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#061257',
        alignItems: 'center',
        zIndex: 100,
        elevation: 5,
    },
    infoText: {
        fontSize: 24,  // Större text
        marginBottom: 15,
        color: '#061257',
        fontWeight: 'bold',
    },
});
      
export default RouteWithDesScreen;