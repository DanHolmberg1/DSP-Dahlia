import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, SafeAreaView } from "react-native";
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
import {Calendar, CalendarList, Agenda, LocaleConfig} from 'react-native-calendars';
import { getGroupByDate } from "./requests/groups"


interface DisplayProps {
    navigation: any,
}

export const DisplayWalk = (props: DisplayProps) => {
    const getAllWalks = async (date: Date) => {
        const groups: Array<any> | undefined = await getGroupByDate(date); 
        if(!groups) {
            //no data 
        }
        return groups; 
    }

    const parseWalkData = (data: JSON) => {
        const { userID, routeID, name, description, availableSpots, date } = data; 
    }
    


return (
    <View>

        <Text>Hello from MyScreen</Text>
        
        
    </View>

    
)};

