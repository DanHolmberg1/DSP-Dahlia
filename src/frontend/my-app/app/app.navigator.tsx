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
import { savedRoute } from "@/components/savedRouteScree";


const { Navigator, Screen } = createStackNavigator();

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
        <Screen options={{
            headerLeft: () => null,
        }} name="Generate routes" component={MapScreen} />
        <Screen options={{
            headerLeft: () => null,
        }} name="Book walk" component={BookWalkScreen} />
        <Screen options={{
            headerLeft: () => null,
        }} name="Walk Buddy" component={WalkBuddyScreen} />
        <Screen options={{
            headerLeft: () => null,
        }} name="Family walk" component={FamilyWalk} />
        <Screen 
        name="Walk with destination" component={RoutewithDesScreen} />
        <Screen  name="Round walk" component={RoundRouteScreen} />
        <Screen  name="Walk with stops" component={TripWithStopsScreen} />
        <Screen  name = "Saved routes" component= {savedRoute}/>
    </Navigator>

); export default AppNavigator;