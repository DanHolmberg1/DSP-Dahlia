import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, SafeAreaView, FlatList, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoundTripRoute } from "./RoundTripRoutingAPI";
import polyline, { decode } from "polyline";
import { start } from "repl";
import { Pressable, ScrollView, TextInput } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker"; 
import { StatusBar } from "expo-status-bar";
import { abort } from "process";
import Arrow from "@/icons/arrow";
import MenuBar from "./menuBar";
import {Calendar, CalendarList, Agenda, LocaleConfig} from 'react-native-calendars';
import { getGroupByDate, sendGroupAdd, getIsInGroup, removeUserFromGroup } from "./requests/groups"
import { useFocusEffect } from "expo-router";
import {createRoute, routeGet} from "./requests/routes"
import { translateCoordinate } from "./CoordinateToAddressAPI";
//OBS MOCK FUNCTION, remove later 
import { mockUser, mockUser2 } from "./requests/mock";
//OBS MOCK FUNCTION, remove later 

interface DisplayProps {
    navigation: any,
    route: any;
}

export const DisplayOneWalk = (props: DisplayProps) => {

    const [walkData, setWalkData] = useState();
    const [title, setTitle] = useState();
    const [time, setTime] = useState<string>();
    const [desc, setDesc] = useState();
    const [route, setRoute] = useState<JSON>();
    const [participants, setPar] = useState<number>(1);
    const [displayRoute, setDisplayRoute] = useState<{longitude: number, latitude: number }[]>([]);
    const [startLocation, setStartLocation] = useState<{latitude: number; longitude: number} | null> (null);
    const [startLat, setStartLat] = useState<number>(59.8586);
    const [startLon, setStartLon] = useState<number>(17.6450);
    const [distance, setDistance] = useState<number>(0);
    const [groupID, setGroupID] = useState();
    const [startLocationString, setStartLocationString] = useState<string>()
    const [hasBookedSuccess, setHasBookedSuccess] = useState(false);
    const [hasBookedFail, setHasBookedFail] = useState(false);
    const [isBooked, setIsbooked] = useState(false);

    const [userId, setUserId] = useState<number>();

    type Coordinate = [number, number];

 
    useEffect( () => {
        const setWalkData = async () => {
            setTitle(props.route.params.walkData.groupName);
            setTime(props.route.params.walkData.datetime);
            setDesc(props.route.params.walkData.description);
            setPar(props.route.params.walkData.availableSpots);
            setGroupID(props.route.params.walkData.id);

        
            console.log("route id here", props.route.params.walkData.routeID);
            const routeResp = await routeGet(props.route.params.walkData.routeID); 
            console.log("route resp", routeResp);
            setRoute(routeResp);

            console.log("route: ", routeResp);  
            if(routeResp) {  
                const resultGeometry = routeResp.routes[0].geometry; 
                setDistance(routeResp.routes[0].summary.distance/1000); 
                console.log("geo: ", resultGeometry);
                const decodegeom = polyline.decode(resultGeometry);
                const formattedRoute = decodegeom.map((coord: number[]) => ({
                    latitude: coord[0],
                    longitude: coord[1],
                }));

                const firstCoord = formattedRoute[0];
                setStartLocation(firstCoord);
                setStartLat(firstCoord.latitude);
                setStartLon(firstCoord.longitude);
                setDisplayRoute(formattedRoute);

                const startCoord: Coordinate = [firstCoord.latitude, firstCoord.longitude];
                const translatedStart = await translateCoordinate(startCoord);
                
                if(translatedStart) {
                    setStartLocationString(translatedStart);
                    console.log("start", startLocationString);
                }
            
            } else{
                console.log("error in decoding route");
            }

            const userID = await mockUser2(); // mockuser
            if( userID) {
            setUserId(userID);
            }

          };
          setWalkData();
    }, []);

    useEffect(() => {
        const isUserBooked = async () => {
            if(groupID && userId) {
            const isBooked = await getIsInGroup(groupID, userId);
            setIsbooked(isBooked);
            }
        }
        isUserBooked();
    }, [groupID]);

    const handleBookSpot = async () => {
       
        console.log("route", route);

        if(isBooked) {
            if(groupID && userId) {
                const resp = await removeUserFromGroup(userId, groupID);
                if(resp) {
                    Alert.alert("Borttagen!", "Du är borttagen från passet.", [{ text: "OK" }])
                    setIsbooked(false);
                }
                else {
                    Alert.alert("Något gick fel!", "Det gick inte att ta bort dig från passet.", [{ text: "OK" }])
                }
                return;
            }
        }
      
        if (userId && groupID) {
            console.log("group id", groupID);
            console.log("used id", userId);
            const resp = await sendGroupAdd(userId, groupID);
            if (resp) {
              Alert.alert("Bokad", "Du har gått med i passet!", [{ text: "OK" }]);
              setIsbooked(true);
            } else {
              Alert.alert("Något gick fel", "Det gick inte att gå med i passet. Försök igen senare.", [{ text: "OK" }]);
            }
        } else {
          Alert.alert("Något gick fel", "Användare eller grupp-ID saknas.", [{ text: "OK" }]);
        }
      };
      


    return (
    <View style={{minHeight: '100%', backgroundColor: "white" }}>

    <ScrollView contentContainerStyle={{paddingBottom: 150, backgroundColor: "white", justifyContent: "flex-start", alignItems: "center", display: "flex", width: "100%", minHeight: "100%"}}>

        <View>
        <Text style= {{fontSize: 45, textAlign: "center", color: "#1B2D92"}}>Titel: {title}</Text>
        </View>

        <View>
        <Text style = {{fontSize: 25, textAlign: "center", color: "#1B2D92" }}>Beskrvning: {desc}</Text>
        </View>
        
        <View>
        <Text style = {{fontSize: 25, textAlign: "center", color: "#1B2D92" }}>Distans: {distance.toFixed(2)} km</Text>
        </View>

        {startLocation && displayRoute.length > 0 && (
        <MapView
            style={{ height: 350, width: "95%", marginTop: 10, borderRadius: 20 }}
            initialRegion={{
            latitude: startLocation.latitude,
            longitude: startLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.05,
            }}
        >
            <Marker coordinate={startLocation} title="Start" pinColor="white" />
            <Polyline coordinates={displayRoute} strokeWidth={4} strokeColor="blue" />
        </MapView>
        )}

            <View style = {{marginTop: 10}}>
                <Text style = {{fontSize: 23, textAlign: "center", color: "#1B2D92"}}>
   
                Datum: {new Date(time?? '').toLocaleString('sv-SE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                })}   
                </Text>  

                <Text style = {{fontSize: 23, textAlign:"center", color: "#1B2D92", marginTop: 10}}>
                Tid: {new Date(time?? '').toLocaleString('sv-SE', {
                hour: '2-digit',
                minute: '2-digit',
                })} 
                </Text>

                <View>
                    <Text style = {{fontSize: 23, textAlign:"center", color: "#1B2D92", marginTop: 10}}> Start: {startLocationString}</Text>
                </View>
                <View>
                    <Text style = {{fontSize: 23, textAlign:"center", color: "#1B2D92", marginTop: 10}}> Deltagare: {10 - participants}/10 </Text>
                </View>

                <TouchableOpacity style={styles.bookSpotContainer} onPress={handleBookSpot}>
                    <Text style={{ color: "white", fontSize: 30 }}>
                        {isBooked ? "Avboka" : "Boka plats"}
                    </Text>
                </TouchableOpacity>
            </View>



        </ScrollView>

        <MenuBar navigation={props.navigation}/>
    </View>
    )
}; const styles = StyleSheet.create({

    bookSpotContainer: {
        backgroundColor: '#E25E17', 
        padding: 20,
        marginTop: 20,
        width: 300,
        marginVertical: 8,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: "center",
        alignItems:"center",
      }
    
});