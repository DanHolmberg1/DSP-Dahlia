import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import MenuBar from "@/components/menuBar";
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

const Messages = ({ route, navigation }: { route: any, navigation: any }) => {
  const { user } = route.params || {};
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      text: 'Hej! Vill du gå en promenad imorgon?',
      sender: 'me',
      time: '12:00'
    },
    {
      id: '2',
      text: 'Hej! Ja det låter trevligt, vid vilken tid?',
      sender: 'them',
      time: '12:05'
    },
    {
      id: '3',
      text: 'Vad sägs om 15:00? Då är det fint väder enligt prognosen.',
      sender: 'me',
      time: '12:10'
    },
    {
      id: '4',
      text: '15:00 passar perfekt! Vi ses vid parkeringen.',
      sender: 'them',
      time: '12:15'
    }
  ]);

  return (
    <View style={styles.container}>
      {/* Header med tillbaka-knapp och användarinfo */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        {user && (
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.userAvatar} 
            />
            <Text style={styles.userName}>{user.name}</Text>
          </View>
        )}
      </View>

      {/* Meddelandehistorik */}
      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageBubble,
              message.sender === 'me' ? styles.myMessage : styles.theirMessage
            ]}
          >
            <Text style={[
              styles.messageText,
              message.sender === 'me' && styles.myMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={[
              styles.messageTime,
              message.sender === 'me' && styles.myMessageTime
            ]}>
              {message.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input area kan läggas till här senare */}

      <MenuBar 
        iconFocus="PROFILE" 
        navigation={navigation} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    borderTopRightRadius: 0,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  myMessageTime: {
    color: '#cce0ff',
  },
});

export default Messages;