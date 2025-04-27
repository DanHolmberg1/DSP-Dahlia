import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { chatAPI } from '@/http/chatAPI';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: number;
  avatar?: string;
};

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await chatAPI.getUsers();
        setUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Välj testanvändare</Text>
      
      <ScrollView style={styles.usersContainer}>
        {users.map((user) => (
          <TouchableOpacity
          key={user.id}
          style={styles.userCard}
          onPress={() => navigation.navigate('ConversationList', { currentUser: { ...user, avatar: user.avatar || '' } })}
        >
          <Image 
            source={{ uri: `https://i.pravatar.cc/150?u=${user.id}` }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userDetails}>{user.age} år • {user.gender === 1 ? 'Kvinna' : 'Man'}</Text>
          </View>
        </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  usersContainer: {
    flex: 1,
    marginBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  userDetails: {
    fontSize: 14,
    color: "#666",
  },
});

export default LoginScreen;