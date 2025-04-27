import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StackNavigationOptions } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import HomeScreen from "../components/HomeScreen";
import MapScreen from "../components/MapScreen";
import WalkBuddyScreen from "../components/WalkBuddyScreen";
import BookWalkScreen from "../components/BookWalkScreen";
import LoginScreen from "../components/LoginScreen";
import CreateAccountScreen from "../components/CreateAccountScreen";
import StartScreen from "../components/StartScreen";
import FamilyWalk from "@/components/FamilyWalk";
import { RoutewithDesScreen } from "@/components/RouteWithDesScreen";
import { RoundRouteScreen } from "@/components/RoundRouteScreen";
import TripWithStopsScreen from "@/components/TripwithStopsScreen";
import ProfileScreen from "@/components/ProfileScreen";
import FindWalks from "@/components/FindWalks";
import DiscoverPeopleScreen from "@/components/DiscoverPeopleScreen";
import ChatScreen from "@/components/ChatScreen";
import ConversationListScreen from "@/components/ConversationListScreen";

const Stack = createStackNavigator<RootStackParamList>();

const screenOptions: StackNavigationOptions = {
  gestureEnabled: false,
  headerLeft: () => null,
};

const AppNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="Start">
    <Stack.Screen name="Start" component={StartScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Create account" component={CreateAccountScreen} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Generate routes" component={MapScreen} />
    <Stack.Screen name="Book walk" component={BookWalkScreen} />
    <Stack.Screen name="Walk Buddy" component={WalkBuddyScreen} />
    <Stack.Screen name="Family walk" component={FamilyWalk} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Find Walks" component={FindWalks} />
    <Stack.Screen name="Walk with destination" component={RoutewithDesScreen} />
    <Stack.Screen name="Find Friends" component={DiscoverPeopleScreen} />
    <Stack.Screen 
      name="Messages" 
      component={ChatScreen} 
      options={({ route }) => ({ title: route.params.chatName })}
    />
    <Stack.Screen 
      name="ConversationList" 
      component={ConversationListScreen} 
      options={{ title: 'Meddelanden' }}
    />
    <Stack.Screen name="Round walk" component={RoundRouteScreen} />
    <Stack.Screen name="Walk with stops" component={TripWithStopsScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
