import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from "react-native";
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

interface Props {
    navigation: any
}

const WalkBuddyScreen = (props: Props) => {
    return (
        <View style={{minHeight: '100%', backgroundColor: "white" }}>
            <Text> Find a walk buddy </Text>
            <MenuBar navigation={props.navigation} />
        </View>
    )
}; export default WalkBuddyScreen;
