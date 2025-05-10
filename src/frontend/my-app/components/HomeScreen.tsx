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
import { MaterialIcons } from "@expo/vector-icons";
import Arrow from "@/icons/arrow";
import MenuBar from "./menuBar";
import { useAuth } from "@/context/authContext"; 
import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from "expo-router";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/app.navigator";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
    navigation: any;
}


const HomeScreen = (props: HomeScreenProps) => {
  const { currentUser } = useAuth();
    //const Map = () => props.navigation.navigate("Map");

    const navigation = useNavigation<HomeScreenNavigationProp>();

    const handleLogout = async () => {
      console.log("hej")
      const auth = getAuth();
      try {
        console.log("hej hej")
        await signOut(auth);
        console.log("hej hej hej")
        navigation.reset({
          index: 0,
          routes: [{ name: 'Start' }],
        });
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to sign out');
      }
    };

    return (

    <View style= {{backgroundColor: "white", flex : 1}}>

<View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>
                (temp)ID: {currentUser?.id || '0'}
            </Text>
    
        </View>


        <View style = {{marginTop: 10}}>
        <Text style = {styles.startText}>
            Välj din
        </Text>

        <Text style = {styles.startTextActivity}>
        aktivitet
        </Text>
        </View>

        <View>
        <TouchableOpacity 
          style={styles.buttoncontainerRoute} 
          onPress={() => props.navigation.navigate('Generate rutter')}
        >
          <Text style={[styles.buttonTextRoute, {textAlign: "center"}]}>Generera rutter</Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity 
          style={[styles.buttoncontainerBook ]} 
          onPress={() => props.navigation.navigate('Book walk')}
        >
          <Text style={[styles.buttonTextBook, {textAlign: "center"}]}>Hitta gruppromenad</Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity 
          style={styles.buttoncontainerFindBuddy} 
          onPress={() => props.navigation.navigate('Walk Buddy')}
        >
          <Text style={styles.buttonTextFindBuddy}>Hitta någon att gå med</Text>
        </TouchableOpacity>
      </View> 

      <View>
        <TouchableOpacity style = {[styles.helpButton, {marginLeft: Platform.OS === 'android' ? 230: 250}, {marginBottom: Platform.OS === 'android' ? 130 : 120}]}
        onPress={() => props.navigation.navigate('Help')}>
            <Text style = {[styles.helpText, {marginLeft: Platform.OS === 'android' ? 29 : 32}]}> Hjälp </Text>

        </TouchableOpacity>
      </View>

        
        <MenuBar navigation={props.navigation}  iconFocus="HOME"/>

        <View>
        <TouchableOpacity style={styles.logoutContainer} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logga ut</Text>
        </TouchableOpacity>
      </View>

    </View>

)};

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
        marginBottom: 40,
        marginTop: 59,
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
        width: "95%",
        marginBottom: -120,
        backgroundColor: '#1B2D92',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 10,
        height: 80,
        alignContent:"center"
    },

    buttoncontainerBook: {
        width: "95%",
        marginBottom: -220,
        backgroundColor: '#1B2D92',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 10,
        height: 80,
         alignContent:"center"
    },

    buttoncontainerFindBuddy: {
        width: "95%",
        marginBottom: -320,
        backgroundColor: '#1B2D92',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 10,
        height: 80,
        alignContent:"center"
    },

    buttonTextRoute: {
        color: 'white',
        fontSize: 30,
        marginTop: 18,
        fontFamily: 'Inter',
    },

    buttonTextBook: {
        color: 'white',
        fontSize: 30,
        marginTop: 18,
        fontFamily: 'Inter',
    },

    buttonTextFindBuddy: {
        color: 'white',
        fontSize: 30,
        marginTop: 18,
        fontFamily: 'Inter',
        textAlign: "center"
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
    
      userInfoContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(225, 94, 23, 0.2)',
        borderRadius: 8,
        padding: 8,
        zIndex: 1,
        borderWidth: 1,
        borderColor: '#E15E17',
    },
    userInfoText: {
        color: '#1B2D92',
        fontSize: 12,
        lineHeight: 16,
    },
    featuresContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    featureIcon: {
        marginRight: 8,
    },

    helpText: {
        color: 'white',
        fontSize: 22,
        marginLeft: 30,
        marginTop: 5,

    },
    logoutContainer: {
      width: "30%",
      marginBottom: 120,
      backgroundColor: '#E25E17',
      position: "absolute",
      bottom: 0,
      borderRadius: 25,
      borderColor: "black",
      marginLeft: 15,
      height: 40,
      fontFamily: 'Inter',
  },

  logoutText: {
    color: 'white',
    fontSize: 22,
    marginLeft: 18,
    marginTop: 5,
},

    
  }); export default HomeScreen;