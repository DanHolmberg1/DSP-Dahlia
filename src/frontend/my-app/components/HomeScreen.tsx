import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  TouchableOpacity,
} from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../app/app.navigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Start' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to sign out');
    }
  };

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <Text style={styles.startText}>Hello</Text>

      <View>
        <Button title="Map" onPress={() => navigation.navigate('Map')} />
      </View>

      <View>
        <Button title="Book walk" onPress={() => navigation.navigate('Book walk')} />
      </View>

      <View>
        <Button title="Find Walk Buddy" onPress={() => navigation.navigate('Walk Buddy')} />
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    inputLable: {
        fontSize: 22,
        color:"white",
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

    startText: {
        fontSize: 50,
        color:'#1B2D92',
        marginBottom: 50,
        marginTop: 55,
        marginLeft: 20,
    },

    startTextActivity: {
        fontSize: 50,
        color:'#1B2D92',
        marginBottom: 0,
        marginTop: -50,
        marginLeft: 20,
        fontWeight: 'bold',
    },

    buttoncontainerRoute: {
        width: "80%",
        marginBottom: -120,
        backgroundColor: '#1B2D92',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 40,
        height: 80,
    },

    buttoncontainerBook: {
        width: "80%",
        marginBottom: -220,
        backgroundColor: '#1B2D92',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 40,
        height: 80,
    },

    buttoncontainerFindBuddy: {
        width: "80%",
        marginBottom: -320,
        backgroundColor: '#1B2D92',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 40,
        height: 80,
    },

    buttonTextRoute: {
        color: 'white',
        fontSize: 30,
        marginLeft: 50,
        marginTop: 18,
        fontFamily: 'Inter',
    },

    buttonTextBook: {
        color: 'white',
        fontSize: 30,
        marginLeft: 90,
        marginTop: 18,
        fontFamily: 'Inter',
    },

    buttonTextFindBuddy: {
        color: 'white',
        fontSize: 30,
        marginLeft: 40,
        marginTop: 18,
        fontFamily: 'Inter',
    },

    helpButton: {
        width: "30%",
        marginBottom: 120,
        backgroundColor: '#E25E17',
        position: "absolute",
        bottom: 0,
        borderRadius: 25,
        borderColor: "black",
        marginLeft: 255,
        height: 40,
        fontFamily: 'Inter',
    },

    helpText: {
        color: 'white',
        fontSize: 22,
        marginLeft: 30,
        marginTop: 5,

    }
  }); export default HomeScreen;