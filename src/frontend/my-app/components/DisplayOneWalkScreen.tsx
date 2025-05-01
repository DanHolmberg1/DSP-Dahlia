import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, SafeAreaView, FlatList } from "react-native";
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
import { getGroupByDate } from "./requests/groups"
import { useFocusEffect } from "expo-router";

interface DisplayProps {
    navigation: any,
    route: any;
}

export const DisplayOneWalk = (props: DisplayProps) => {

    const [walkData, setWalkData] = useState();
    const [title, setTitle] = useState();
    const [time, setTime] = useState<string>();
    const [desc, setDesc] = useState();
    const [route, setRoute] = useState();
    const [participants, setPar] = useState<number>(1);

    // useEffect(()=> {

    //     if(props.route.param.walkData.walk) {
    //         setWalkData(props.route.param.walkData.walk);
    //     }
    // },[])

    useEffect(()=> {
        setTitle(props.route.params.walkData.groupName);
        setTime(props.route.params.walkData.datetime);
        setDesc(props.route.params.walkData.description);
        setRoute(props.route.params.walkData.routeID);
        setPar(props.route.params.walkData.availableSpots);

      // get route from db
    });

    const handleBookSpot = () => {
        //book a spot
    }


    return (
        <View style={{minHeight: '100%', backgroundColor: "white" }}>

        <ScrollView contentContainerStyle={{paddingBottom: 150, backgroundColor: "white", justifyContent: "flex-start", alignItems: "center", display: "flex", width: "100%", minHeight: "100%"}}>

        <View>
        <Text style= {{fontSize: 45, textAlign: "center", color: "#1B2D92"}}>Titel: {title}</Text>
        </View>

        <View>
        <Text style = {{fontSize: 25, textAlign: "center", color: "#1B2D92" }}>Beskrvning: {desc}</Text>
        </View>

    
        <MapView
                style={{height: 350, width: "95%", marginTop: 10, borderRadius: 20}}
                initialRegion={{
                latitude: 59.8586, //Example center (Uppsala) TODO: is it possible to change the start screen based on user location?
                longitude: 17.6450,
                latitudeDelta: 0.05, // Zoom level
                longitudeDelta: 0.05,
                }}
            >
            </MapView> 

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
                    <Text style = {{fontSize: 23, textAlign:"center", color: "#1B2D92", marginTop: 10}}> Start: Placeholder </Text>
                </View>
                <View>
                    <Text style = {{fontSize: 23, textAlign:"center", color: "#1B2D92", marginTop: 10}}> Deltagare: {10 - participants}/10 </Text>
                </View>

                <TouchableOpacity style = {styles.bookSpotContainer}>
                    <Text style = {{color: "white", fontSize: 30}}>
                        Boka plats
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