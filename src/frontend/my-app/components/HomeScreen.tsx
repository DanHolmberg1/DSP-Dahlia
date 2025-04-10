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

interface HomeScreenProps {
    navigation: any;
}

const HomeScreen = (props: HomeScreenProps) => {

    //const Map = () => props.navigation.navigate("Map");

    return (

        <View style={{ backgroundColor: "white", flex: 1 }}>
            <Text style={styles.startText}>
                Hello
            </Text>

            <View>
                <Button title="Generate routes" onPress={() => props.navigation.navigate('Generate routes')} />
            </View>

            <View>
                <Button title="Book walk" onPress={() => props.navigation.navigate('Book walk')} />
            </View>
            <View>
                <Button title="Messages" onPress={() => props.navigation.navigate('MessageMenu')} />
            </View>
            <View>
                <Button title="Find Walk Buddy" onPress={() => props.navigation.navigate('Walk Buddy')} />
            </View>
            <View>
                <Button title="Find Walks" onPress={() => props.navigation.navigate('Find Walks')} />
            </View>
            <View>
  <Button title="Find Friends" onPress={() => props.navigation.navigate('Find Friends')} />
</View>
            <MenuBar navigation={props.navigation} iconFocus="HOME" />
        </View>
        

    )
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    controls: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "30%",
        backgroundColor: 'rgba(52, 52, 52, 0.8)',
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    inputLable: {
        fontSize: 22,
        color: "white",
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
        fontSize: 22,
        color: "black",
        marginBottom: 50,
        marginTop: 80,
        marginLeft: 20,


    },
}); export default HomeScreen;