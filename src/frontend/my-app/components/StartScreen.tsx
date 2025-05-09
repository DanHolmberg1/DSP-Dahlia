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


interface StartProps {
    navigation: any;
}
const StartScreen = (props: StartProps) => {
    return (
        
        <View style={{backgroundColor: "white", flex : 1}}>
            <Text>
                Logga in eller skapa ett konto!
            </Text>

            <Button title = "Logga in" onPress={() => props.navigation.navigate("Login")}/>
            <Button title = "Skapa konto" onPress={() => props.navigation.navigate("Create account")}/>
            
        </View>
    )
}; export default StartScreen;

