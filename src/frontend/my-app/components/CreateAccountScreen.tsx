import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, ScrollView } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoundTripRoute } from "./RoundTripRoutingAPI";
import polyline, { decode } from "polyline";
import { start } from "repl";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import { socketService } from "@/socket/socketService";

interface CreateAccountProps {
    navigation: any;
}
const interestsList = [
    'Spel', 'Natur', 'Hundar', 'Träning', 'Konst',
    'Musik', 'Matlagning', 'Resor', 'Läsning', 'Film'
  ];
const CreateAccountScreen = (props: CreateAccountProps) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('0');
    const [selectedInterests, setSelectedInterests] = useState<{[key: string]: boolean}>({});
    const [error, setError] = useState('');
    const [profilePic, setProfilePic] = useState(null); // How can we save a picture?
    // Add other info needed

    const handleInterestToggle = (interest: string) => {
        const newSelection = {...selectedInterests};
        newSelection[interest] = !newSelection[interest];
        
        // Count selected interests
        const selectedCount = Object.values(newSelection).filter(Boolean).length;
        if (selectedCount <= 5 || newSelection[interest] === false) {
          setSelectedInterests(newSelection);
        }
      };

      const handleCreateAccount = async () => {
        // Reset error state
        setError('');
      
        // Basic validation
        if (!email || !password || !name || !age) {
          setError('All fields are required');
          return;
        }
      
        if (Object.values(selectedInterests).filter(Boolean).length === 0) {
          setError('Please select at least one interest');
          return;
        }
      
        // Prepare data
        const userData = {
          email,
          password,
          name,
          age: parseInt(age),
          gender: parseInt(gender), // Convert to number
          interests: Object.keys(selectedInterests).filter(int => selectedInterests[int])
        };
      
        try {
          // Single API call that handles everything
          const result = await socketService.createAccount(userData);
      
          if (result.success) {
            props.navigation.navigate("Home");
          } else {
            // This will catch "Email already exists" and other server-side validation errors
            setError(result.error || 'Account creation failed');
          }
        } catch (err) {
          setError('Network error. Please try again.');
          console.error(err);
        }
      };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Create account</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Age"
            keyboardType="numeric"
            value={age}
            onChangeText={(text) => {
              if (/^\d*$/.test(text)) {
                setAge(text);
              }
            }}
          />

          <Text style={styles.label}>Gender</Text>
          <Picker
            selectedValue={gender}
            style={styles.picker}
            onValueChange={(itemValue) => setGender(itemValue)}
          >
            <Picker.Item label="Woman" value="0" />
            <Picker.Item label="Man" value="1" />
            <Picker.Item label="Other" value="2" />
          </Picker>

          <Text style={styles.label}>Interests (max 5)</Text>
          <View style={styles.interestsContainer}>
            {interestsList.map((interest) => (
              <View key={interest} style={styles.interestItem}>
                <TouchableOpacity onPress={() => handleInterestToggle(interest)} style={styles.checkboxRow}>
  <Text style={styles.checkboxSymbol}>
    {selectedInterests[interest] ? '☑' : '☐'}
  </Text>
  <Text style={styles.interestText}>{interest}</Text>
</TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateAccount}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  interestText: {
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  checkboxSymbol: {
    fontSize: 20,
  },
});

export default CreateAccountScreen;