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
import { SavedRoute } from "@/components/savedRouteScree";
import { Help } from "@/components/HelpScreen";
import CreateWalk from "@/components/CreateWalkScreen";
import AddRoute from "@/components/AddRouteScreen";
import { DisplayWalk } from "@/components/DisplayWalksScreen";
import ConversationListScreen from "@/components/ConversationListScreen";
import { AuthProvider } from "../context/authContext"; 
import ChatScreen from "@/components/ChatScreen";

const { Navigator, Screen } = createStackNavigator();

const AppNavigator = () => (
    <AuthProvider>
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
        <Screen name="Book walk" component={BookWalkScreen} options={{
            headerBackTitle: 'Home', 
          }}  />
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
        <Screen 
      name="ConversationList" 
      component={ConversationListScreen}
      options={{ headerLeft: () => null }}
    />
        <Screen  name = "Skapa promenad" component= {CreateWalk}
        options={{
            headerBackTitle: 'Book Walk', 
          }} />
        <Screen  name = "Välj rutt" component= {AddRoute}/>
        <Screen name = "Tillgängliga pass" component= {DisplayWalk}/>
        <Screen name = "Chat" component= {ChatScreen}/>
        
    </Navigator>
    </AuthProvider>
); export default AppNavigator;