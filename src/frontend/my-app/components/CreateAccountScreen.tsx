import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoundTripRoute } from "./RoundTripRoutingAPI";
import polyline, { decode } from "polyline";
import { start } from "repl";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker"; 
import { StatusBar } from "expo-status-bar";
import { abort } from "process";
import Arrow from "@/icons/arrow";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; 
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { sendUserCreate } from "./requests/users";


interface CreateAccountProps {
    navigation: any;
}

const CreateAccountScreen = (props: CreateAccountProps) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    //const [profilePic, setProfilePic] = useState(null); // How can we save a picture?
    // Add other info needed

    const accCreate = async () => {

      if(!email || !password || !name) {
        alert("Besvara alla fält");
        return;
      }
      const auth = getAuth();
      const db = getFirestore()
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User registered:', userCredential.user);

        await updateProfile(user, {
            displayName: name,
          });


          //Add to database???
          const userID = await sendUserCreate(name, email, Number(age), 1); //change when implemented 

          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            UserId: userID
          });

        await user.reload();
        console.log('Updated user info:', auth.currentUser?.displayName);
        console.log('')





        props.navigation.navigate("Home"); 

      } catch (error: any) {
        console.error('Signup error:', error.message);
        alert('Signup failed: ' + error.message);
      }
    };

    return (

        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 

        <View style = {styles.container}>

          <View style = {{marginTop: -50}}>
          <Text style = {styles.startText}>
                Skapa konto
            </Text>
          </View>

  <View style = {{alignContent: "center", marginTop: -220}}>

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
          placeholder="Lösenord"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

    <TextInput
          style={styles.inputPassword}
          placeholderTextColor="#888"
          placeholder="Namn"
          value={name}
          onChangeText={setName}
        />

      <TextInput
        keyboardType="numeric"
        value={age.toString()}
        onChangeText={(age) => {
          setAge(age);  // just update state, no validation here
        }}
        onEndEditing={() => {
          const validNum = Number(age);
          if (validNum <= 17 || validNum >= 122) {
            alert('Ogiltig ålder');
          }
        }}
        style={styles.inputAge}
        placeholderTextColor="#888"
        placeholder="Ålder"
      />


  </View>


        
        <Button title="Create Account" onPress={accCreate} />

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
        //marginLeft: 90,
        //position: "absolute",
        textAlign: "center"
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

      inputAge: {
        height: 50,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 10,
      },
  });
 export default CreateAccountScreen;