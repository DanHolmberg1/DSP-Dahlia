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
  startText: {
    fontSize: 22,
    color: 'black',
    marginBottom: 50,
    marginTop: 80,
    marginLeft: 20,
  },
  logoutContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  logoutButton: {
    backgroundColor: '#1B2D92',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
