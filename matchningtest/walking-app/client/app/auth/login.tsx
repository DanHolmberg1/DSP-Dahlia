// client/app/auth/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  // client/app/auth/login.tsx
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.0.118:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      console.log('Login response:', response); // Debug-logg
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
  
      const data = await response.json();
      console.log('Login data:', data); // Debug-logg
      
      // Se till att denna rad finns:
      await login(email, password); 
      
      // Omdirigera till matches-sidan
      router.replace('/matches');
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert(
        'Inloggning misslyckades',
        err instanceof Error ? err.message : 'Något gick fel. Kontrollera servern och nätverket.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff' }]}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Logga in</Text>
      
      <TextInput
        style={styles.input}
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Lösenord"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button 
        title={loading ? "Laddar..." : "Logga in"} 
        onPress={handleLogin} 
        disabled={loading}
      />

      <Link href="/auth/register" asChild>
        <Text style={styles.registerLink}>Inget konto? Registrera dig här</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  registerLink: {
    marginTop: 20,
    textAlign: 'center',
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});