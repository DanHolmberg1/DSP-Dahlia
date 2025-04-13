import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoundTripRoute, getRoundTripRouteCircle } from "./RoundTripRoutingAPI";
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
import { RemoveDuplicates, RoundRouting, calculateSquare, calulateCircle } from "./RoundRoutingAlgortihm";
import { all } from "axios";

export const showRoute = () => {

    useEffect(() => {




    }, []);


    return (


<View>
<MapView
style={styles.map}
initialRegion={{
latitude: 59.8586, //Example center (Uppsala) TODO: is it possible to change the start screen based on user location?
longitude: 17.6450,
latitudeDelta: 0.05, // Zoom level
longitudeDelta: 0.05,
}}

>
{route.length > 0 && <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" /> }
</MapView> 

</View>

)};

const styles = StyleSheet.create({
container: { flex: 1 },
map: { flex: 1 },
});