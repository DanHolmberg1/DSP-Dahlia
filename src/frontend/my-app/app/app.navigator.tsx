import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../components/HomeScreen";
import MapScreen from "../components/MapScreen";
import WalkBuddyScreen from "../components/WalkBuddyScreen"
import { Stack } from "expo-router";
import BookWalkScreen from "../components/BookWalkScreen";
import LoginScreen from "../components/LoginScreen";
import CreateAccountScreen from "../components/CreateAccountScreen";
import StartScreen from "../components/StartScreen";
import FamilyWalk from "@/components/FamilyWalk";

const {Navigator, Screen} = createStackNavigator();

const AppNavigator = () => (
    
    <Navigator initialRouteName="Start">
            <Screen name = "Start" component={StartScreen}/>
            <Screen name = "Login" component={LoginScreen}/>
            <Screen name = "Create account" component={CreateAccountScreen}/>
            <Screen name = "Home" component={HomeScreen} />
            <Screen name = "Map" component={MapScreen}/>
            <Screen name = "Book walk" component={BookWalkScreen}/>
            <Screen name = "Walk Buddy" component={WalkBuddyScreen}/>
            <Screen name = "Family walk" component={FamilyWalk}/>


    </Navigator>
        
); export default AppNavigator;