import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface Profile {
  displayName: string;
  birthDate: Date;
  interests: string[];
}

interface ProfileScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

const interestsList = [
  'Promenader', 'Natur', 'Hundar', 'Träning', 'Konst',
  'Musik', 'Matlagning', 'Resor', 'Läsning', 'Film'
];

const ProfileScreen: React.FC<ProfileScreenProps> = (props) => {
  const today = new Date();
  const currentYear = today.getFullYear();

  const [profile, setProfile] = useState<Profile>({
    displayName: 'Testanvändare',
    birthDate: new Date(2000, 0, 1),
    interests: []
  });

  const [selectedYear, setSelectedYear] = useState(profile.birthDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(profile.birthDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(profile.birthDate.getDate());

  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    setProfile((prev) => ({ ...prev, birthDate: newDate }));
  }, [selectedYear, selectedMonth, selectedDay]);

  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : prev.interests.length < 5
          ? [...prev.interests, interest]
          : prev.interests
    }));
  };

  const handleSave = () => {
    Alert.alert(
      'Profil sparad',
      `Namn: ${profile.displayName}\nFödelsedatum: ${profile.birthDate.toDateString()}\nIntressen: ${profile.interests.join(', ')}`
    );
    props.navigation.navigate('Home');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Min Profil</Text>

      <TextInput
        style={styles.input}
        value={profile.displayName}
        onChangeText={(text) => setProfile({ ...profile, displayName: text })}
        placeholder="Ange ditt namn"
      />

      <Text style={styles.label}>Födelsedatum</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedYear}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}>
          {years.map((year) => (
            <Picker.Item key={year} label={year.toString()} value={year} />
          ))}
        </Picker>

        <Picker
          selectedValue={selectedMonth}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}>
          {months.map((month) => (
            <Picker.Item key={month} label={month.toString()} value={month} />
          ))}
        </Picker>

        <Picker
          selectedValue={selectedDay}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedDay(itemValue)}>
          {days.map((day) => (
            <Picker.Item key={day} label={day.toString()} value={day} />
          ))}
        </Picker>
      </View>

      <Text>Valt: {profile.birthDate.toDateString()}</Text>

      <Text style={styles.label}>Välj intressen (max 5):</Text>
      <View style={styles.interestsContainer}>
        {interestsList.map((interest) => (
          <View key={interest} style={styles.interestButton}>
            <Button
              title={interest}
              onPress={() => toggleInterest(interest)}
              color={profile.interests.includes(interest) ? '#4CAF50' : '#DDD'}
            />
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Spara profil" onPress={handleSave} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Tillbaka" onPress={() => props.navigation.goBack()} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: '100%',
  },
  label: {
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10
  },
  picker: {
    flex: 1,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  interestButton: {
    width: '48%',
    marginBottom: 10,
  },
});

export default ProfileScreen;