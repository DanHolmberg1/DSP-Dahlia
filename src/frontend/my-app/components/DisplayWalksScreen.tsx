import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, SafeAreaView, FlatList } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoundTripRoute } from "./RoundTripRoutingAPI";
import polyline, { decode } from "polyline";
import { start } from "repl";
import { Pressable, ScrollView, TextInput } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker"; 
import { StatusBar } from "expo-status-bar";
import { abort } from "process";
import Arrow from "@/icons/arrow";
import MenuBar from "./menuBar";
import {Calendar, CalendarList, Agenda, LocaleConfig} from 'react-native-calendars';
import { getGroupByDate } from "./requests/groups"
import { useFocusEffect } from "expo-router";


interface DisplayProps {
    navigation: any,
    route: any;
}

export const DisplayWalk = (props: DisplayProps) => {
    const [chosenDate, setChosenDate] = useState<string>();
    const [valid, setValid] = useState<boolean>();
    const [walks, setWalks] = useState<Array<any>>([]);
    const [length, setlength] = useState<number>(0);
    const [noWalks, setNoWalks] = useState<boolean>(false);

    useEffect(() => {
        const getAllWalks = async () => {
                const groups: Array<any> | undefined = await getGroupByDate(new Date(props.route.params.dateInfo.date)); 
                
                if(groups) {
                    console.log("En kommentar ")
                    setWalks(groups); 
                    setlength(groups.length);

                }
        }

        getAllWalks();
    }, []); 

    const parseWalkData = (data: JSON) => {
        const { userID, routeID, name, description, availableSpots, date } = data; 
    }
    
return (
    <View style={{minHeight: '100%', backgroundColor: "white" }}>
        <ScrollView>

        <Text style = {styles.dateTime}> Hitta pass för:  {props.route.params.dateInfo.date} </Text>

        <View>

        {walks && walks.length > 0  ? (
          walks.map((walk, index) => (
          <TouchableOpacity
            key={index}
            style={styles.itemContainer}
            onPress={() => props.navigation.navigate("Pass", { walkData: walk })}
          >
            <View style={styles.item}>
              <Text style={styles.title}>Titel: {walk.groupName}</Text>
              <Text style={styles.time}>
                Tid:
                {new Date(walk.datetime).toLocaleString("sv-SE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style = {{fontSize: 25, textAlign: "center", marginTop: 25}}>Inga pass hittades</Text>
      )}

      </View>
    </ScrollView>

        <MenuBar navigation={props.navigation}/>
 
    </View>

)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
  },

  dateTime: {
    fontSize: 30
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
    color: "white",
    marginTop: 10
  },

  time: {
    fontSize: 20,
    color: "white",
    marginTop:10,
    marginLeft: -10
  },

  itemContainer: {
    backgroundColor: '#E25E17', 
    padding: 15,
    marginVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ccc', 
    justifyContent: "center",
    alignItems:"center",
    width: "95%",
    marginLeft: 10
  }
});

