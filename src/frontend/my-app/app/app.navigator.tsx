import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { socketService } from '@/socket/socketService';
import HomeScreen from "../components/HomeScreen";
import MapScreen from "../components/MapScreen";
import WalkBuddyScreen from "../components/WalkBuddyScreen";
import BookWalkScreen from "../components/BookWalkScreen";
import LoginScreen from "../components/LoginScreen";
import CreateAccountScreen from "../components/CreateAccountScreen";
import StartScreen from "../components/StartScreen";
import FamilyWalk from "@/components/FamilyWalk";
import ProfileScreen from "@/components/ProfileScreen";
import TestSocketScreen from '../components/TestSocketScreen';
import RoundRouteScreen from "@/components/RoundRouteScreen";
import RouteWithDesScreen from "../components/routeWithDesScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
    useEffect(() => {
      socketService.connect();
      return () => socketService.disconnect();
    }, []);

  return (
    
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Create account" component={CreateAccountScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Book walk" component={BookWalkScreen} />
        <Stack.Screen name="Walk Buddy" component={WalkBuddyScreen} />
        <Stack.Screen name="Family walk" component={FamilyWalk} />
        <Stack.Screen name="Profile"component ={ProfileScreen} />
        <Stack.Screen name="SocketTest" component={TestSocketScreen} />
        <Stack.Screen name="Round walk" component={RoundRouteScreen} />
        <Stack.Screen name="Walk with destination" component={RouteWithDesScreen} />
      </Stack.Navigator>
    
  );
};

export default AppNavigator;