//LOG IN FROM CHAT BRANCH

import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  Button, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Image 
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { chatAPI } from "./requests/chatAPI";
import { useAuth } from "@/context/authContext"; // Uppdaterad import-sökväg

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
    latitude?: number;
    longitude?: number;
    features?: string[]; // Anta att features är en array av strängar
    pace?: string; // Anta att pace är en sträng (t.ex. 'Låg', 'Medium', 'Hög')
    bio?: string; // Anta att bio är en sträng
  // Lägg till andra relevanta fält
}

interface LoginProps {
  navigation: any;
}

const LoginScreen = (props: LoginProps) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await chatAPI.getUsers();
        setUsers(users);
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = () => {
    if (selectedUser) {
      login(selectedUser); // Spara användaren globalt
      props.navigation.navigate("Home");
    }
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setEmail(user.email);
    setPassword('password123'); // Standardlösenord för test
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E15F18" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      > 
        <View style={styles.container}>
          <Text style={styles.startText}>Log in to your account</Text>

          <Text style={styles.testUsersTitle}>Select a test account:</Text>
          
          <ScrollView 
            horizontal 
            style={styles.usersContainer}
            showsHorizontalScrollIndicator={false}
          >
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userCard,
                  selectedUser?.id === user.id && styles.selectedUserCard
                ]}
                onPress={() => selectUser(user)}
              >
                <View style={styles.avatarContainer}>
                  {user.avatar ? (
                    <Image 
                      source={{ uri: user.avatar }} 
                      style={styles.avatarImage} 
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {user.name.charAt(0)}
                    </Text>
                  )}
                </View>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.inputEmail}
            placeholderTextColor="#888"
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!selectedUser}
          />

          <TextInput
            style={styles.inputPassword}
            placeholderTextColor="#888"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!selectedUser}
          />

          <View style={styles.loginButton}>
            <Button 
              title={selectedUser ? `Login as ${selectedUser.name}` : "Login"} 
              onPress={handleLogin} 
              color="#E15F18"
              disabled={!selectedUser} // Inaktivera om ingen användare valts
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  startText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "black",
    marginBottom: 30,
    marginTop: 80,
    textAlign: 'center',
  },
  testUsersTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  usersContainer: {
    marginBottom: 20,
    maxHeight: 120,
  },
  userCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedUserCard: {
    backgroundColor: '#E15F18',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  inputEmail: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  inputPassword: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 25,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  loginButton: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  registerText: {
    color: '#E15F18',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default LoginScreen;