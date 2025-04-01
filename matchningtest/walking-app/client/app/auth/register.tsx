// app/auth/register.tsx
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('man');
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const response = await fetch('http://192.168.0.118:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, age, gender }),
      });
  
      console.log('Register response:', response); // Debug-logg
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration error details:', errorData); // Ny debug-logg
        throw new Error(errorData.error || errorData.details || 'Registration failed');
      }
  
      const data = await response.json();
      console.log('Registration data:', data); // Debug-logg
      
      await login(email, password); 
      router.replace('/matches');
    } catch (err) {
      console.error('Registration error:', err);
      Alert.alert(
        'Registrering misslyckades',
        err instanceof Error ? err.message : 'Kontrollera servern och nätverket'
      );
    }
  };
  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Användarnamn" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="E-post" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Lösenord" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Ålder" keyboardType="numeric" value={age} onChangeText={setAge} />
      
      <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker}>
        <Picker.Item label="Man" value="man" />
        <Picker.Item label="Kvinna" value="kvinna" />
        <Picker.Item label="Annat" value="annat" />
      </Picker>

      <Button title="Registrera" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { height: 50, borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10, backgroundColor: '#fff' },
  picker: { height: 50, marginBottom: 20 },
});