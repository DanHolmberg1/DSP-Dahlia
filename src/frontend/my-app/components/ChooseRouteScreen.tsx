import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import polyline from "polyline";
import MenuBar from "./menuBar";
import { StyleSheet, TextInput, View, Text, Button, 
        KeyboardAvoidingView, Platform, TouchableWithoutFeedback, 
        Keyboard, TouchableOpacity,  } from "react-native";


interface ChooseScreenProps {
    navigation: any;
}

// Screen där du väljer vilken typ av rutt du vill skapa
const ChooseRoute = (props: ChooseScreenProps) => {

    return (
    <View style={styles.container}>
        <View style={{ marginTop: 20}}>
            <Text style={styles.headerText}>Vad för typ av rutt{"\n"} vill du skapa?</Text>
        </View>

        {/** Knappar */}
    <View style={{marginTop: 40}}>
            {/** Rundpromenad */}
            <View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => props.navigation.navigate("Rundpromenad")}
                >
                <Text style={styles.buttonText}>Rundpromenad</Text>
            </TouchableOpacity>
            </View>
        
            {/** Start - stop */}
            <View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => props.navigation.navigate("Start-stop")}
                >
                <Text style={styles.buttonText}>Start till slutpunkt</Text>
            </TouchableOpacity>
            </View>
        
            {/** Rutt med stopp */}
            <View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => props.navigation.navigate("Rutt med stopp")}
                >
                <Text style={styles.buttonText}>Rutt med flera stopp</Text>
            </TouchableOpacity>
            </View>
    </View>

    {/** Sparade rutter-knapp */}
    <View style={styles.bottomContainer}>
      <TouchableOpacity 
        style={styles.saveButtonContainer} 
        onPress={() => props.navigation.navigate("Sparade rutter")}
      >
        <Text style={styles.savedRouteText}>Sparade rutter</Text>
      </TouchableOpacity>
    </View>
    {/** MenuBar */}
    <MenuBar navigation={props.navigation}/>
    </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "white",
    },
    headerText: {
        fontSize: 40,
        textAlign: "center",
        margin: 20,
        fontFamily: 'Inter',
    },
    button: {
        backgroundColor: "#1B2D92",
        padding: 20,
        margin: 10,
        borderRadius: 30,
        
      },
      buttonText: {
        color: "white",
        fontSize: 25,
        textAlign:'center',
        fontWeight: 'bold',
        fontFamily: 'Inter',
      },
      saveButtonContainer: {
        width: "60%",
        backgroundColor: '#E15F18',
        borderRadius: 30,
        color: "black",
        padding: 20,
        marginTop: 50,
      },
      savedRouteText: {
        color: "white",
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: 'Inter',
        
      },
      bottomContainer: {
        alignItems: "center",
        marginBottom: 10,
      },
})

export default ChooseRoute;