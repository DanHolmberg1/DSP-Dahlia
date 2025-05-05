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
import { RoutewithDesScreen } from "@/components/RouteWithDesScreen";
import { RoundRouteScreen } from "@/components/RoundRouteScreen";
import TripWithStopsScreen from "@/components/TripwithStopsScreen";
import { SavedRoute, savedRoute } from "@/components/savedRouteScree";
import { Help, help } from "@/components/HelpScreen";


export type RootStackParamList = {
    Start: undefined;
    Login: undefined;
    'Create account': undefined;
    Home: undefined;
    Map: undefined;
    'Book walk': undefined;
    'Walk Buddy': undefined;
    'Family walk': undefined;
  };

  const stack = createStackNavigator<RootStackParamList>();
  const { Navigator, Screen } = stack;

const AppNavigator = () => (

    <Navigator screenOptions={{
        gestureEnabled: false, 
    }} initialRouteName="Start">
        <Screen options={{
            headerLeft: () => null, 
        }} name="Start" component={StartScreen} />
        <Screen options={{
            headerLeft: () => null, 
        }} name="Login" component={LoginScreen} />
        <Screen options={{
            headerLeft: () => null, 
        }} name="Create account" component={CreateAccountScreen} />
        <Screen options={{
            headerLeft: () => null, 
        }} name="Home" component={HomeScreen} />
        <Screen name="Generate routes" component={MapScreen} />
        <Screen name="Book walk" component={BookWalkScreen} />
        <Screen name="Walk Buddy" component={WalkBuddyScreen} />
        <Screen options={{
            headerLeft: () => null,
        }} name="Family walk" component={FamilyWalk} />
        <Screen 
        name="Walk with destination" component={RoutewithDesScreen} />
        <Screen  name="Round walk" component={RoundRouteScreen} />
        <Screen  name="Walk with stops" component={TripWithStopsScreen} />
        <Screen  name = "Saved routes" component= {SavedRoute}/>
        <Screen  name = "Help" component= {Help}/>
    </Navigator>

); export default AppNavigator;