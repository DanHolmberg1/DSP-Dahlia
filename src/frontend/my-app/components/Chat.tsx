// src/frontend/my-app/components/ChatComponent.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { createChat, joinChat, sendMessage, getMessages } from './http/httpRequestClient';

const Chat: React.FC<{ userId: number }> = ({ userId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<number | null>(null);

  // Skapa en testchat när komponenten laddas
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Skapa en ny chat
        const chatRes = await createChat('Test Chat');
        if (chatRes.success && chatRes.chatId) {
          setCurrentChat(chatRes.chatId);
          
          // Gå med i chatten
          await joinChat(chatRes.chatId, userId);
          
          // Hämta meddelanden (tom lista i början)
          const messagesRes = await getMessages(chatRes.chatId);
          if (messagesRes.success && messagesRes.messages) {
            setMessages(messagesRes.messages);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();
  }, [userId]);

  const handleSendMessage = async () => {
    if (message.trim() && currentChat) {
      try {
        const res = await sendMessage(currentChat, userId, message);
        if (res.success) {
          setMessage('');
          // Hämta uppdaterad meddelandelista
          const updatedMessages = await getMessages(currentChat);
          if (updatedMessages.success && updatedMessages.messages) {
            setMessages(updatedMessages.messages);
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      
      {/* Meddelandelista */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text style={styles.messageUser}>User {item.user_id}:</Text>
            <Text>{item.content}</Text>
          </View>
        )}
        style={styles.messagesList}
      />

      {/* Meddelandeinput */}
      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Skriv ett meddelande..."
          style={styles.input}
        />
        <Button title="Skicka" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

// Samma styles som tidigare
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  messagesList: {
    flex: 1,
    marginBottom: 16,
  },
  message: {
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  messageUser: {
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
});

export default Chat;