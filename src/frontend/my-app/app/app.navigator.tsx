import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../components/HomeScreen";
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
import ChooseRoute from "@/components/ChooseRouteScreen";


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
        <Screen name="Generera rutter" component={ChooseRoute} />
        <Screen name="Promenera med andra" component={BookWalkScreen} />
        <Screen name="Promenadkompis" component={WalkBuddyScreen} />
        <Screen options={{
            headerLeft: () => null,
        }} name="Family walk" component={FamilyWalk} />
        <Screen 
        name="Start-stop" component={RoutewithDesScreen} />
        <Screen  name="Rundpromenad" component={RoundRouteScreen} />
        <Screen  name="Rutt med stopp" component={TripWithStopsScreen} />
        <Screen  name = "Sparade rutter" component= {SavedRoute}/>
        <Screen  name = "Hjälp" component= {Help}/>
    </Navigator>

); export default AppNavigator;