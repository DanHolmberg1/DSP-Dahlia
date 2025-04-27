import React from "react";
import { StyleSheet, View, Text, Button, TouchableOpacity } from "react-native";
import MenuBar from "./menuBar";

interface HomeScreenProps {
    navigation: any;
}

const HomeScreen = (props: HomeScreenProps) => {
    return (
        <View style={{ backgroundColor: "white", flex: 1 }}>
            <Text style={styles.startText}>
                Hello
            </Text>

            <View style={styles.buttonContainer}>
                <Button 
                    title="Generate routes" 
                    onPress={() => props.navigation.navigate('Generate routes')} 
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button 
                    title="Book walk" 
                    onPress={() => props.navigation.navigate('Book walk')} 
                />
            </View>
            
            <View style={styles.buttonContainer}>
                <Button 
                    title="Messages" 
                    onPress={() => props.navigation.navigate('ConversationList')} // Uppdaterat här
                />
            </View>
            
            <View style={styles.buttonContainer}>
                <Button 
                    title="Find Walk Buddy" 
                    onPress={() => props.navigation.navigate('Walk Buddy')} 
                />
            </View>
            
            <View style={styles.buttonContainer}>
                <Button 
                    title="Find Walks" 
                    onPress={() => props.navigation.navigate('Find Walks')} 
                />
            </View>
            
            <View style={styles.buttonContainer}>
                <Button 
                    title="Find Friends" 
                    onPress={() => props.navigation.navigate('Find Friends')} // Redan korrekt
                />
            </View>
            
            <MenuBar navigation={props.navigation} iconFocus="HOME" />
        </View>
    )
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    buttonContainer: {
        marginBottom: 15,
        marginHorizontal: 20
    },
    startText: {
        fontSize: 22,
        color: "black",
        marginBottom: 50,
        marginTop: 80,
        marginLeft: 20,
    },
   
    controls: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "30%",
        backgroundColor: 'rgba(52, 52, 52, 0.8)',
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    inputLable: {
        fontSize: 22,
        color: "white",
        marginBottom: 50,
        marginTop: 20,

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

}); export default HomeScreen;