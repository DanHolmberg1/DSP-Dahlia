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

interface savedRouteProps {
    navigation: any
  }
  
export const SavedRoute = (props: savedRouteProps) => {

    const [allRoutes, setAllRoutes] = useState<any[]>([]);

    useEffect(() => {

        const getAllRoutes = async() => {
            const routeData: any = await fetch(`http://0.0.0.0:3000/routesGet&UserId=${123}`); // need to add userid
            setAllRoutes(routeData.data);
        }
    },[]);

    return (
        <View>
            <View>
                {allRoutes.map((route, index) => (
                               <TouchableOpacity onPress={props.navigation.navigate(`/route/${route.id}`)} style={styles.buttoncontainerRoute}>
                               <Text style={[styles.buttonTextRoute, {marginLeft: Platform.OS === 'android' ? 40: 40}]}>{index}</Text>
                           </TouchableOpacity>
                ))}
            </View>
        </View>
)}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
        fontSize: 50,
        color:'#1B2D92',
        marginBottom: 50,
        marginTop: 55,
        marginLeft: 20,
    },

    startTextActivity: {
        fontSize: 50,
        color:'#1B2D92',
        marginBottom: 0,
        marginTop: -50,
        marginLeft: 20,
        fontWeight: 'bold',
    },

    buttoncontainerRoute: {
        width: "80%",
        marginBottom: -150,
        backgroundColor: '#E25E17',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 40,
        height: 100,
    },

    buttoncontainerBook: {
        width: "80%",
        marginBottom: -220,
        backgroundColor: '#1B2D92',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 40,
        height: 80,
    },

    buttoncontainerFindBuddy: {
        width: "80%",
        marginBottom: -320,
        backgroundColor: '#1B2D92',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 40,
        height: 80,
    },

    buttonTextRoute: {
        color: 'white',
        fontSize: 30,
        marginLeft: 50,
        marginTop: 18,
        fontFamily: 'Inter',
    },

    buttonTextBook: {
        color: 'white',
        fontSize: 30,
        marginLeft: 90,
        marginTop: 18,
        fontFamily: 'Inter',
    },

    buttonTextFindBuddy: {
        color: 'white',
        fontSize: 30,
        marginLeft: 40,
        marginTop: 18,
        fontFamily: 'Inter',
    },

    helpButton: {
        width: "30%",
        marginBottom: 120,
        backgroundColor: '#E25E17',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 255,
        height: 40,
        fontFamily: 'Inter',
    },

    helpText: {
        color: 'white',
        fontSize: 22,
        marginLeft: 30,
        marginTop: 5,

    }
  });