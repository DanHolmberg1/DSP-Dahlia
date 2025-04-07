import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { socketService } from '@/socket/socketService';

const interestsList = [
  'Spel', 'Natur', 'Hundar', 'Träning', 'Konst',
  'Musik', 'Matlagning', 'Resor', 'Läsning', 'Film'
];

interface ProfileScreenProps {
  navigation: any; // Eller mer specifik typ om du vill
  route: any; // lyckas inte få den att fungera med app.navigator.tsx //ingen typsäkerhet
}

const ProfileScreen = (props: ProfileScreenProps) => {
  const { navigation, route } = props;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '0',
  });
  const [selectedInterests, setSelectedInterests] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = route.params?.userId ?? undefined;
        if (userId === undefined || isNaN(userId)) {
          setError('Ogiltigt användar-ID');
          setLoading(false);
          return;
        }
        const response = await socketService.getUserProfile(userId);
        
        if (response.success && response.data) {
          const user = response.data;
          setFormData({
            name: user.name,
            email: user.email,
            age: user.age.toString(),
            gender: user.sex.toString(),
          });
          
          // Initiera intressen
          const interestsObj: {[key: string]: boolean} = {};
          if (user.interests) {
            user.interests.forEach(int => interestsObj[int] = true);
          }
          setSelectedInterests(interestsObj);
        } else {
          setError(response.error || 'Kunde inte hämta profil');
        }
      } catch (err) {
        setError('Nätverksfel. Försök igen.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [route.params?.userId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    const newSelection = { ...selectedInterests };
    const selectedCount = Object.values(newSelection).filter(Boolean).length;
    
    if (newSelection[interest] || selectedCount < 5) {
      newSelection[interest] = !newSelection[interest];
      setSelectedInterests(newSelection);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    // Validering
    if (!formData.name.trim()) {
      setError('Namn är obligatoriskt');
      setSaving(false);
      return;
    }

    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setError('Ange en giltig ålder (1-120)');
      setSaving(false);
      return;
    }

    try {
      const interests = Object.keys(selectedInterests).filter(int => selectedInterests[int]);
      const result = await socketService.updateUserProfile({
        id: route.params?.userId ?? 0,
        name: formData.name,
        email: formData.email,
        age: ageNum,
        sex: parseInt(formData.gender),
        interests
      });

      if (result.success) {
        Alert.alert('Sparad', 'Din profil har uppdaterats');
        navigation.goBack();
      } else {
        setError(result.error || 'Kunde inte spara ändringar');
      }
    } catch (err) {
      setError('Nätverksfel. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Hämtar profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Redigera profil</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.label}>Namn</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholder="Ditt namn"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>E-post</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={formData.email}
          editable={false}
          placeholder="Din e-post"
        />
        <Text style={styles.hint}>E-post kan inte ändras</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Ålder</Text>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={(text) => handleInputChange('age', text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          placeholder="Din ålder"
          maxLength={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Kön</Text>
        <Picker
          selectedValue={formData.gender}
          onValueChange={(value) => handleInputChange('gender', value)}
          style={styles.picker}
        >
          <Picker.Item label="Kvinna" value="0" />
          <Picker.Item label="Man" value="1" />
          <Picker.Item label="Annat/Önskar inte ange" value="2" />
        </Picker>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Intressen (max 5)</Text>
        <View style={styles.interestsContainer}>
          {interestsList.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestButton,
                selectedInterests[interest] && styles.selectedInterest
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text style={styles.interestText}>{interest}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Spara ändringar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.buttonText}>Avbryt</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  section: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333'
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  disabledInput: {
    backgroundColor: '#eee',
    color: '#666'
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  picker: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  interestButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedInterest: {
    backgroundColor: '#e1f5fe',
    borderColor: '#4fc3f7'
  },
  interestText: {
    fontSize: 14
  },
  buttonGroup: {
    marginTop: 20,
    gap: 12
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButton: {
    backgroundColor: '#2e7d32'
  },
  cancelButton: {
    backgroundColor: '#757575'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4
  }
});

export default ProfileScreen;