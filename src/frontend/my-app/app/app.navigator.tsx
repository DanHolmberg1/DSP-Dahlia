import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../components/HomeScreen";
import MapScreen from "../components/MapScreen";
import { Stack } from "expo-router";

const {Navigator, Screen} = createStackNavigator();

const AppNavigator = () => (
    
    <Navigator initialRouteName="Home">
            <Screen name ="Home" component={HomeScreen} />
            <Screen name = "Map" component={MapScreen}/>
    </Navigator>
        
    

); export default AppNavigator;