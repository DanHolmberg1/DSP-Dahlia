import React, { useState, useRef } from "react";
import { Picker } from "@react-native-picker/picker";
import MenuBar from "./menuBar";
import { StyleSheet, View, Text, TouchableOpacity, Pressable } from "react-native";
import Checkbox from 'expo-checkbox';
import Arrow from "@/icons/arrow";
import MapView, { Marker } from "react-native-maps";

// Navigation via MenuBar
interface ChooseScreenProps {
    navigation: any;
}

// Screen där du väljer vilken typ av rutt du vill skapa
const ChooseRoute = (props: ChooseScreenProps) => {

  const [isChecked, setChecked] = useState(false);
  const [menuExpand, setMenuExpand] = useState<boolean>(true);
  const [optionExpand, setOptionExpand] = useState<boolean>(true);
  const [startLocation, setStartLocation] = useState<{latitude: number; longitude: number} | null> (null);
  const pickerRef = useRef<Picker<string> | null>(null); 
  const [showStartText, setShowStartText] = useState<boolean>(true);
  const [ShowOptions, setShowOptions] = useState<boolean>(true);
  const [HasShowOptions, setHasShowOptions] = useState<boolean>(false);

  const toggleOptionExpander = () => setOptionExpand(prev => !prev);
  const toggleMenuExpander = () => setMenuExpand(prev => !prev);

  return (
    <View style={styles.container}>
      
      {/* Övre panelen */}
      <View style={styles.panelContainer}>
        <View>
          <Text style={styles.headerText}>Designa din rutt</Text>
        </View>
  
        {menuExpand && (
          <View style={styles.choiseBar}>
            <View style={styles.buttonContainer}>
              <View style={styles.buttonRows}>
                <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate("Rundpromenad")}>
                  <Text style={styles.buttonText}>Rundpromenad</Text>
                </TouchableOpacity>
  
                <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate("Start-stop")}>
                  <Text style={styles.buttonText}>Start till slutpunkt</Text>
                </TouchableOpacity>
              </View>
  
              <View style={styles.buttonRows}>
                <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate("Rutt med stopp")}>
                  <Text style={styles.buttonText}>Rutt med flera stopp</Text>
                </TouchableOpacity>
  
                <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate("Sparade rutter")}>
                  <Text style={styles.buttonText}>Sparade rutter</Text>
                </TouchableOpacity>
              </View>
            </View>
  
            <View style={styles.checkboxContainer}>
              <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
              <Text style={styles.paragraph}>Undvik trappor{"\n"}och skarpa stigningar</Text>
            </View>
          </View>
        )}
  
        <Pressable style={styles.arrowButton} onPress={toggleMenuExpander}>
          <Arrow width={36} height={36} angle={menuExpand} />
        </Pressable>
      </View>
  
      {/* Kartan nedanför panelen */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 59.8586,
          longitude: 17.6450,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={(e) => {
          setStartLocation(e.nativeEvent.coordinate);
          setShowStartText(false);
          if (!HasShowOptions) {
            setShowOptions(true);
            setHasShowOptions(true);
          }
          console.log("ShowOptions:", ShowOptions);
        }}
      >
        {startLocation && <Marker coordinate={startLocation} title="Start" />}
      </MapView>
  
      {/* Meny längst ner */}
      <MenuBar navigation={props.navigation} />
    </View>
  );
  
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    headerText: {
        fontSize: 35,
        textAlign: "center",
        marginBottom: 20,
        fontFamily: 'Inter',
    },
    button: {
        backgroundColor: "#1B2D92",
        padding: 20,
        margin: 5,
        borderRadius: 30,
      },
      buttonText: {
        color: "white",
        fontSize: 17,
        textAlign:'center',
        fontWeight: 'bold',
        fontFamily: 'Inter',
      },
      buttonContainer: {
        flexDirection: "column",
      },
      buttonRows: {
        flexDirection: "row",
      },
      paragraph: {
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 10,
      },
      checkbox: {
        margin: 8,
      },
      checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        margin: 18,
      },
      choiseBar: {
      },
      arrowButton: {
        backgroundColor: "white",
        marginBottom: 10
      },
      panelContainer: {
        backgroundColor: "white",
        alignItems: "center",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        position: "absolute",
        width: "100%",
        zIndex: 10,  
        // iOS shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      map: { 
        flex: 1,
        zIndex: 1,

      },

})

export default ChooseRoute;