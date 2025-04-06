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
}

const BookWalkScreen = (props: BookingProps) => {
    const [bookSpot, setbookSpot] = useState<boolean>(false);

    return (
    <View style={{minHeight: '100%', backgroundColor: "white" }}> 
        <Text style = {styles.HeaderText}> Book a walk with others!</Text>
        <Text style = {styles.StartText}> Share a walk with others!</Text>

        <View style = {styles.BookContainer}> 
            <Button title = 'Family walk' onPress={() => props.navigation.navigate("Family walk")}/>
            {/* <Text style = {styles.FamilyWalkText}> Family walk</Text> */}
           

        </View>
        <MenuBar navigation={props.navigation}/>

    </View>
    )

    

}; 

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
    BookContainer: {
        backgroundColor: 'rgb(5, 6, 58)',
        padding: 0, // Add some padding to make it look less cramped
        alignItems: 'center', // Center the text
        justifyContent: 'center',
        position: 'absolute', // Position it over the screen if needed
        top: 160, // Position it at the top or adjust based on your layout
        left: 15,
        right: 0,
        zIndex: 10, // Ensure it sits above other elements
        borderRadius: 20,
        width: 360,  // Adjust width
        height: 170, // Adjust height
        
    },
    StartText: {
        fontSize: 20,
        color:"black",
        marginBottom: 50,
        marginTop: 20,
        left: 10,
        fontFamily: 'inter',
    
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
    HeaderText: {
        fontSize: 32,
        color:'rgb(5, 6, 58)',
        marginBottom: 10,
        marginTop: 20,
        marginLeft: 0,
        fontFamily: 'inter',
        
    },
    OptionContainer: {
      flex: 1,
      backgroundColor: 'rgba(6, 18, 87, 0.8)',
      padding: 20,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      zIndex: 10,
      position: 'absolute', // Keeps it positioned relative to the screen
      top: 0,  // Move to the top instead of bottom
      width: '100%', 
      marginBottom: 0, // Remove margin to avoid gaps
    },

    FamilyWalkText: {
      fontSize: 22,
      color: "white",
      marginTop: 0,  // Remove any margin from the top
      marginBottom: 0,  // Remove margin at the bottom if you want to keep it tight
      textAlign: 'left',  // Align the text to the left
      fontFamily: 'inter',
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
    buttoncontainerTripWithStops: {
      width: "60%",
      marginBottom: 30,
      marginLeft: 150,
      backgroundColor: 'white',
      position: "absolute",
      bottom: 0,
      borderRadius: 30,
      borderColor: "white",
      color: "black",
      left: -5,
    },
    
    OptionsMenu: {
      marginTop: 80, // Ensures buttons are not cut off
      width: "100%",
      alignItems: "center",
    },
    centerButtonContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: 150,
      zIndex: 10,
  },

});

export default BookWalkScreen;