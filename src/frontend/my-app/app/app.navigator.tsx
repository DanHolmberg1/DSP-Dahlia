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
import { DisplayOneWalk } from "@/components/DisplayOneWalkScreen";
import  {DisplayUserGroups} from "@/components/DisplayUserGroups"
import ChooseRoute from "@/components/ChooseRouteScreen";

const { Navigator, Screen } = createStackNavigator();

export type RootStackParamList = {
    Start: undefined;
    Login: undefined;
    'Create account': undefined;
    Home: undefined;
    Map: undefined;
    'Book walk': { dateInfo: { date: string } };
    'Walk Buddy': undefined;
    'Family walk': undefined;
    'Generate routes': undefined;   
    'Walk with destination': undefined;
    'Round walk': undefined;
    'Walk with stops': undefined;
    'Saved routes': undefined;
    'Help': undefined;
    'Skapa promenad': undefined;
    'Välj rutt': undefined;
    'Tillgängliga pass': undefined;
    'Pass': undefined;
};

const stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => (
    <AuthProvider>
    <Navigator screenOptions={{
        gestureEnabled: false, 
    }} initialRouteName="Start">
        <Screen options={{
            headerLeft: () => null, 
        }} name="Start" component={StartScreen} />
        <Screen name="Login" component={LoginScreen} />
        <Screen name="Create account" component={CreateAccountScreen} />
        <Screen options={{
            headerLeft: () => null, 
        }} name="Home" component={HomeScreen} />
        <Screen name="Generate rutter" component={ChooseRoute} />
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
        <Screen name = "Pass" component= {DisplayOneWalk}/>
        <Screen name = "Users groups" component={DisplayUserGroups}/>
        <Screen 
      name="ConversationList" 
      component={ConversationListScreen}
     />
        <Screen  name = "Skapa promenad" component= {CreateWalk}
        options={{
            headerBackTitle: 'Book Walk', 
          }} />
        <Screen  name = "Välj rutt" component= {AddRoute}/>
        <Screen name = "Tillgängliga pass" component= {DisplayWalk}/>
        <Screen name = "Chat" component= {ChatScreen}/>
        <Screen 
        name="Start-stop" component={RoutewithDesScreen} />
        <Screen  name="Rundpromenad" component={RoundRouteScreen} />
        <Screen  name="Rutt med stopp" component={TripWithStopsScreen} />
        <Screen  name = "Sparade rutter" component= {SavedRoute}/>
        
    </Navigator>
    </AuthProvider>
); export default AppNavigator;



//APP NAVIGATOR FROM MAIN

// import React from "react";
// import { createStackNavigator, StackNavigationProp } from "@react-navigation/stack";
// import { NavigationContainer, RouteProp } from "@react-navigation/native";
// import HomeScreen from "./components/HomeScreen";
// import MapScreen from "./components/MapScreen";
// import WalkBuddyScreen from "./components/WalkBuddyScreen"
// import { Stack } from "expo-router";
// import BookWalkScreen from "./components/BookWalkScreen";
// import LoginScreen from "./components/LoginScreen";
// import CreateAccountScreen from "./components/CreateAccountScreen";
// import StartScreen from "./components/StartScreen";
// import FamilyWalk from "@/components/FamilyWalk";
// import { RoutewithDesScreen } from "@/components/RouteWithDesScreen";
// import { RoundRouteScreen } from "@/components/RoundRouteScreen";
// import TripWithStopsScreen from "@/components/TripwithStopsScreen";
// import { SavedRoute } from "@/components/savedRouteScree";
// import { Help } from "@/components/HelpScreen";
// import CreateWalk from "@/components/CreateWalkScreen";
// import AddRoute from "@/components/AddRouteScreen";
// import { DisplayWalk } from "@/components/DisplayWalksScreen";
// import { DisplayOneWalk } from "@/components/DisplayOneWalkScreen";


// export type RootStackParamList = {
//     Start: undefined;
//     Login: undefined;
//     'Create account': undefined;
//     Home: undefined;
//     Map: undefined;
//     'Book walk': { dateInfo: { date: string } };
//     'Walk Buddy': undefined;
//     'Family walk': undefined;
//     'Generate routes': undefined;   
//     'Walk with destination': undefined;
//     'Round walk': undefined;
//     'Walk with stops': undefined;
//     'Saved routes': undefined;
//     'Help': undefined;
//     'Skapa promenad': undefined;
//     'Välj rutt': undefined;
//     'Tillgängliga pass': undefined;
//     'Pass': undefined;
// };

// // type BookingScreenProps = {
// //     navigation: StackNavigationProp<RootStackParamList, 'Book walk'>;
// //     route: RouteProp<RootStackParamList, 'Book walk'>;
// //   };

//   const stack = createStackNavigator<RootStackParamList>();
//   const { Navigator, Screen } = stack;

// const AppNavigator = () => (

//     <Navigator screenOptions={{
//         gestureEnabled: false, 
//     }} initialRouteName="Start">
//         <Screen options={{
//             headerLeft: () => null, 
//         }} name="Start" component={StartScreen} />
//         <Screen name="Login" component={LoginScreen} />
//         <Screen name="Create account" component={CreateAccountScreen} />
//         <Screen options={{
//             headerLeft: () => null, 
//         }} name="Home" component={HomeScreen} />
//         <Screen name="Generate routes" component={MapScreen} />
//         <Screen name="Book walk" component={BookWalkScreen} options={{
//             headerBackTitle: 'Home', 
//           }}  />
//         <Screen name="Walk Buddy" component={WalkBuddyScreen} />
//         <Screen options={{
//             headerLeft: () => null,
//         }} name="Family walk" component={FamilyWalk} />
//         <Screen 
//         name="Walk with destination" component={RoutewithDesScreen} />
//         <Screen  name="Round walk" component={RoundRouteScreen} />
//         <Screen  name="Walk with stops" component={TripWithStopsScreen} />
//         <Screen  name = "Saved routes" component= {SavedRoute}/>
//         <Screen  name = "Help" component= {Help}/>
//         <Screen  name = "Skapa promenad" component= {CreateWalk}
//         options={{
//             headerBackTitle: 'Book Walk', 
//           }} />
//         <Screen  name = "Välj rutt" component= {AddRoute}/>
//         <Screen name = "Tillgängliga pass" component= {DisplayWalk}/>
//         <Screen name = "Pass" component= {DisplayOneWalk}/>
        
//     </Navigator>
  

// ); export default AppNavigator;