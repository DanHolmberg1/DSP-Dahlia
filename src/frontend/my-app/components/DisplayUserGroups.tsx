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
import { getAllGroupsForUser } from "./requests/groups"
import { useFocusEffect } from "expo-router";
import {USERID} from "./global/userID"


interface DisplayProps {
    navigation: any,
    route: any;
}

export const DisplayUserGroups = (props: DisplayProps) => {
    const [chosenDate, setChosenDate] = useState<Date>(new Date());
    const [valid, setValid] = useState<boolean>();
    const [walks, setWalks] = useState<Array<any>>([]);
    const [length, setlength] = useState<number>(0);
    const [noWalks, setNoWalks] = useState<boolean>(false);

    useEffect(() => {
        const getAllWalks = async () => {
                const groups: Array<any> | undefined = await getAllGroupsForUser(USERID); 
                
                if(groups) {
                    setWalks(groups); 
                    setlength(groups.length);

                }

                setChosenDate(props.route.params.dateInfo.date);
        }

        getAllWalks();
    }, []); 

    
return (
    <View style={{minHeight: '100%', backgroundColor: "white" }}>
              <View style = {{backgroundColor: "#1B2D92", padding: 20}}>
        <Text style = {styles.dateTime}> Mina grupper:                             
         </Text>
        </View>
        <ScrollView>


        <View style = {{marginTop: 30}}>

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
                Tid: {new Date(walk.datetime).toLocaleString("sv-SE", {
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
        <Text style = {{fontSize: 25, textAlign: "center", marginTop: 10, color: "grey"}}>Inga pass hittades</Text>
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
    fontSize: 30,
    color: "white",
    textAlign: "center"
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
    color: "white",
    marginTop: 10,
    textAlign: "center"
  },

  time: {
    fontSize: 20,
    color: "white",
    marginTop:10,
    textAlign: "center"
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