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
        
        <View style={{backgroundColor: "white", flex : 1, minHeight: "100%"}}>

            <View style={{ position: 'absolute', top: 20, right: 20 }}>
            <TouchableOpacity style = {{borderRadius: 20, backgroundColor: "#E15F18", height: 40, width: "110%", marginRight: 50}}
            onPress={() => props.navigation.navigate('Help')}>
                <Text style = {{textAlign: "center", justifyContent: "center", marginTop: 5, fontSize: 25, color: "white"}}> Hjälp </Text>
    
            </TouchableOpacity>
            </View>

            <View>
            <Text style = {{fontSize: 70, textAlign: "center", marginTop: 80, fontWeight: "bold", color: "#1B2D92"}}>
                Walk&Talk
            </Text>
            <Text style = {{fontSize: 30, textAlign: "center", marginTop: 40, fontWeight: "bold", color: "#1B2D92"}}>
                Välkommen till Walk&Talk!
            </Text>

            <Text style = {{fontSize: 20, textAlign: "left", marginTop: 10, fontWeight: "bold", color: "#1B2D92", padding: 20}}>
                Logga in på ditt konto eller skapa ett nytt konto och börja walk and talk!
            </Text>

            </View>
 

        <View style = {{alignItems: "center", marginTop: 70, flex: 1}}>
        <TouchableOpacity style = {{borderRadius: 70, backgroundColor: "#E15F18", width: "80%", height: 60}} onPress={() => props.navigation.navigate("Login")}>
                        <Text style = {{textAlign: "center", marginTop: 15, fontSize: 25, color: "white"}}> Logga in </Text>
        </TouchableOpacity>

     

       
        <TouchableOpacity style = {{borderRadius: 70, backgroundColor: "#E15F18", width: "80%", height: 60, marginTop: 20}}  onPress={() => props.navigation.navigate("Create account")}>
                        <Text style = {{textAlign: "center", marginTop: 15, fontSize: 25, color: "white"}}> Skapa konto </Text>
        </TouchableOpacity>

        </View>
    

            {/* <Button title = "Logga in" onPress={() => props.navigation.navigate("Login")}/>
            <Button title = "Skapa konto" onPress={() => props.navigation.navigate("Create account")}/> */}
            
        </View>
    )
}; export default StartScreen;

