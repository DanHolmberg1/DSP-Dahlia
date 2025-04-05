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

interface LoginProps {
    navigation: any;
}

const LoginScreen = (props: LoginProps) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (

        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 

        <View style = {styles.container}>
            <Text style = {styles.startText}>
                Log in to your account
            </Text>

            {/* <Text style = {styles.inputEmail}> 
                
            </Text> */}

        <TextInput
          style={styles.inputEmail}
          placeholderTextColor="#888"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

    <TextInput
          style={styles.inputPassword}
          placeholderTextColor="#888"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button title="Login" onPress={() => props.navigation.navigate("Home")} />

        </View>
        </KeyboardAvoidingView>
       </TouchableWithoutFeedback>

    )
}; 

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: "white",
        padding: 10,
    },

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
    messageContainer: {
        backgroundColor: 'rgba(7, 39, 14, 0.8)',
        padding: 10, // Add some padding to make it look less cramped
        alignItems: 'center', // Center the text
        justifyContent: 'center',
        position: 'absolute', // Position it over the screen if needed
        top: 0, // Position it at the top or adjust based on your layout
        left: 0,
        right: 0,
        zIndex: 10, // Ensure it sits above other elements
      },
    inputLable: {
        fontSize: 22,
        color:"white",
        marginBottom: 50,
        marginTop: 20,
    
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
        fontSize: 30,
        color:"black",
        marginBottom: 10,
        marginTop: 85,
        marginLeft: 55,
        position: "absolute",
    },

    inputEmail: {
        height: 50,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 250,
      },

      
    inputPassword: {
        height: 50,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 10,
      },
  }); export default LoginScreen;