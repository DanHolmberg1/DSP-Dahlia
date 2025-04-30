import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, SafeAreaView, FlatList } from "react-native";
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
import {Calendar, CalendarList, Agenda, LocaleConfig} from 'react-native-calendars';
import { getGroupByDate } from "./requests/groups"


interface DisplayProps {
    navigation: any,
    route: any;
}

export const DisplayWalk = (props: DisplayProps) => {
    const [chosenDate, setChosenDate] = useState<string>();
    const [valid, setValid] = useState<boolean>();
    const [walks, setWalks] = useState<Array<any>>([]);
    const [length, setlength] = useState<number>(0);
    
    /*
    useEffect(() => {
        if (props.route.params?.dateInfo) {
            setChosenDate(props.route.params.dateInfo);
            console.log("date", chosenDate);
    }
    }, [props.route.params?.dateInfo]); */

    useEffect(() => {
        if (props.route.params?.dateInfo) {
            setChosenDate(props.route.params?.dateInfo.date); 
            console.log("date", props.route.params.dateInfo.date);
        }
    }, [props.route.params?.dateInfo]);

    useEffect(() => {
        const getAllWalks = async () => {
            if (chosenDate) {
                const groups: Array<any> | undefined = await getGroupByDate(new Date(chosenDate)); 
                if(groups) {
                    setWalks(groups); 
                    setlength(groups.length);
                }else {
                    setWalks([]);
                }
            }
        }

        getAllWalks();
    }, [chosenDate]); 


    const Item = ({title}: ItemProps) => (
        <View style={styles.item}>
          <Text style={styles.title}>{title}</Text>
        </View>
      );
    
return (
    <View>

        <Text> pass</Text>

        <View>

            {length > 0 ? (

        <FlatList
            data={walks}
            renderItem={({ item }) => (
                <Text style={styles.title}>
                  {item.name ?? "Unnamed"} - {item.description ?? "No description"}
                </Text>
            )}
              keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
            
          />
              
            ) : <Text> inga pass</Text>        
        }

        </View>

        
    </View>

    
)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});

