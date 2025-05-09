import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { getAuth, signInWithEmailAndPassword,// @ts-ignore
  getReactNativePersistence, initializeAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserByEmail, getUserByID } from "./requests/users";
import { useAuth } from "../context/authContext";
import { chatAPI } from "./requests/chatAPI";
const firebaseConfig = {
  apiKey: "AIzaSyDRa50GANID0l131R59Gr2ybUQc64YwAOs",
  authDomain: "dahlia-334fa.firebaseapp.com",
  projectId: "dahlia-334fa",
  storageBucket: "dahlia-334fa.appspot.com",
  messagingSenderId: "981511080704",
  appId: "1:981511080704:web:ba2da57709d561a38901e5",
  measurementId: "G-5S5ML74VDP",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

interface LoginProps {
  navigation: any;
}

const LoginScreen = ({ navigation }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();

  const handleLogin = async () => {
  if (!email || !password) {
    alert("Besvara alla fält");
    return;
  }

  try {
    // Firebase auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Hämta vårt eget userID från databasen
    const userID = await getUserByEmail(email);
    if (!userID) {
      alert("Kunde inte hitta användar-ID");
      return;
    }

    // Hämta hela user-objektet med den nya funktionen
    const fullUser = await chatAPI.getUser(userID);
    if (!fullUser) {
      alert("Kunde inte hämta användardata");
      return;
    }

    // Spara användare i context och navigera
    login(fullUser);
    navigation.navigate("Home");

  } catch (error: any) {
    console.error("Login error:", error.message);
    alert("Inloggning misslyckades: " + error.message);
  }
};

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <Text style={styles.startText}>Logga in på ditt konto</Text>

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

          <Button title="Logga in" onPress={handleLogin} />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
  startText: {
    fontSize: 30,
    color: "black",
    marginBottom: 10,
    marginTop: 85,
    marginLeft: 55,
    position: "absolute",
  },
  inputEmail: {
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 250,
  },
  inputPassword: {
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default LoginScreen;
