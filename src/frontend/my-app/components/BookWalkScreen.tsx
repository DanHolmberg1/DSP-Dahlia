import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, BackHandler, ScrollView } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoundTripRoute } from "./RoundTripRoutingAPI";
import polyline, { decode } from "polyline";
import { start } from "repl";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker"; 
import { StatusBar } from "expo-status-bar";
import { abort } from "process";
import Arrow from "@/icons/arrow";
import MenuBar from "./menuBar";
import { useNavigation } from "expo-router";
import {Calendar, CalendarList, Agenda, LocaleConfig} from 'react-native-calendars';
import { getAuth } from 'firebase/auth';
import { get } from "http";

LocaleConfig.locales['sv'] = {
  monthNames: [
    'januari',
    'februari',
    'mars',
    'april',
    'maj',
    'juni',
    'juli',
    'augusti',
    'september',
    'oktober',
    'november',
    'december'
  ],
  monthNamesShort: [
    'jan',
    'feb',
    'mar',
    'apr',
    'maj',
    'jun',
    'jul',
    'aug',
    'sep',
    'okt',
    'nov',
    'dec'
  ],
  dayNames: [
    'söndag',
    'måndag',
    'tisdag',
    'onsdag',
    'torsdag',
    'fredag',
    'lördag'
  ],
  dayNamesShort: ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'],
  today: 'Idag'
};

LocaleConfig.defaultLocale = 'sv';

// interface BookingProps {
//     navigation: any,
//     route: any,
//     date: any
// }

type BookingScreenNavigationProp = {
  navigate: (screen: string, params?: object) => void;
};

type BookingScreenRouteProp = {
  params: {
    dateInfo: { date: string };
  };
};

// Define the props type for the component
interface BookingProps {
  navigation: BookingScreenNavigationProp;
  route: BookingScreenRouteProp;
}

const BookWalkScreen = (props: BookingProps) => {
  
  const auth = getAuth();
  const userId = auth.currentUser;
  
  const [selectedDate, setSelected] = useState('');

  const handleDate = (date:string) => {
    console.log("SELECTED " + selectedDate)
    props.navigation.navigate("Tillgängliga pass", {dateInfo: {
      date: date 
    }})

  }

  const navigation = useNavigation();

  useEffect(() => {
    const onBackPress = () => {
      navigation.navigate('Home' as never); 
      return true; 
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
    const beforeRemove = navigation.addListener('beforeRemove', (e:any) => {
      e.preventDefault(); 
      navigation.navigate('Home' as never);
    });
  
    return () => {
      backHandler.remove();
      beforeRemove(); 
    };
  }, [navigation]);

    return (
    <View style={{minHeight: '100%', backgroundColor: "white" }}> 
     <ScrollView contentContainerStyle={{paddingBottom: 150, backgroundColor: "white", justifyContent: "flex-start", display: "flex", width: "100%", minHeight: "100%"}}>
    
        <Text style = {styles.HeaderText}> Boka en tur!</Text>

          <View style={{ marginRight: Platform.OS === 'android' ? -30: 0 }}>
         <TouchableOpacity 
           style={styles.createWalkConatiner} 
           onPress={() => props.navigation.navigate("Skapa promenad")}
         >
           <Text style = {styles.Addsign}> + </Text>
         </TouchableOpacity>
       </View>

       <View style = {{marginTop: 10}}>

          <Calendar
          style={{ }}
              onDayPress={(day: any) => {
                handleDate(day.dateString);
              }}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#E25E17',
                },
              }}
              theme={{
                dayTextColor: 'black',        // Regular day numbers
                todayTextColor: 'blue',        // Today's date
                selectedDayTextColor: 'white',// Text color when selected
                textDisabledColor: 'gray',    // Disabled (non-current month) 
              }}
            />
        </View>

        <View style = {{borderRadius: 20, width: "95%", height: 200, backgroundColor: "#1B2D92", alignItems: "center", alignSelf: "center",  marginTop: 40}}>
          <Text style = {{fontSize: 30, color: "white", marginTop: 10}}>
            Mina bokningar
          </Text>
          
        </View>

        </ScrollView>

        <MenuBar navigation={props.navigation}/>

    </View>
)}; 

const styles = StyleSheet.create({
    container: { flex: 1 },
    controls: {
        position: "absolute",
        bottom: 0,
        width:"100%",
        height:"30%",
        backgroundColor: 'rgba(52, 52, 52, 0.8)',
        padding: 20,
        justifyContent:"center",
        alignItems:"center",
    },
    createWalkConatiner: {
      width: "30%",
      marginBottom: 10,
      backgroundColor: '#F5BFA2',
      position: "absolute",
      bottom: 0,
      borderRadius: 30,
      borderColor: "black",
      color: "black",
      marginLeft: 250,
      marginTop: 0
    },

    futureWalksContainer: {
      width: "30%",
      marginBottom: 10,
      backgroundColor: '#F5BFA2',
      position: "absolute",
      bottom: 0,
      borderRadius: 30,
      borderColor: "black",
      color: "black",
      marginLeft: 250,
      marginTop: 50
    },

    Addsign : {
      fontSize: 30,
      marginLeft: 45,
      marginBottom: 4,

    },

    AddSignContainer: {

    },
    BookContainer: {
        backgroundColor: 'rgb(5, 6, 58)',
        padding: 0, // Add some padding to make it look less cramped
        alignItems: 'center', // Center the text
        justifyContent: 'center',
        position: 'absolute', // Position it over the screen if needed
        top: 160, // Position it at the top or adjust based on your layout
        left: 15,
        right: 0,
        zIndex: 10, // Ensure it sits above other elements
        borderRadius: 20,
        width: 360,  // Adjust width
        height: 170, // Adjust height
        
    },
    StartText: {
        fontSize: 20,
        color:"black",
        marginBottom: 50,
        marginTop: 20,
        left: 10,
        fontFamily: 'inter',
    
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 8,
        backgroundColor: "white", // Set background color for the input field
        color: "black",
        width: "100%", // Make input take the full width
    },
    buttoncontainer: {
        width: "50%",
        marginBottom: 40,
        backgroundColor: 'white',
        position: "absolute",
        bottom: 0,
        borderRadius: 30,
        borderColor: "black",
        color: "black"
    },
    HeaderText: {
        fontSize: 32,
        color:'rgb(5, 6, 58)',
        marginBottom: 10,
        marginTop: 20,
        marginLeft: 5,
        fontFamily: 'inter',
        
    },
    OptionContainer: {
      flex: 1,
      backgroundColor: 'rgba(6, 18, 87, 0.8)',
      padding: 20,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      zIndex: 10,
      position: 'absolute', // Keeps it positioned relative to the screen
      top: 0,  // Move to the top instead of bottom
      width: '100%', 
      marginBottom: 0, // Remove margin to avoid gaps
    },

    FamilyWalkText: {
      fontSize: 22,
      color: "white",
      marginTop: 0,  // Remove any margin from the top
      marginBottom: 0,  // Remove margin at the bottom if you want to keep it tight
      textAlign: 'left',  // Align the text to the left
      fontFamily: 'inter',
    },
    
    buttoncontainerRoundTrip: {
      width: "40%",
      marginBottom: 30,
      backgroundColor: 'white',
      position: "absolute",
      bottom: 0,
      borderRadius: 30,
      borderColor: "white",
      color: "black",
      left: -5,
    },
    buttoncontainerTripWithDes: {
      width: "60%",
      marginBottom: -20,
      backgroundColor: 'white',
      position: "absolute",
      bottom: 0,
      borderRadius: 30,
      borderColor: "white",
      color: "black",
      left: -5,
    },
    buttoncontainerTripWithStops: {
      width: "60%",
      marginBottom: 30,
      marginLeft: 150,
      backgroundColor: 'white',
      position: "absolute",
      bottom: 0,
      borderRadius: 30,
      borderColor: "white",
      color: "black",
      left: -5,
    },
    
    OptionsMenu: {
      marginTop: 80, // Ensures buttons are not cut off
      width: "100%",
      alignItems: "center",
    },
    centerButtonContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: 150,
      zIndex: 10,
  },

});

export default BookWalkScreen;