import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TextInput, 
  TouchableOpacity 
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { chatAPI } from "@/http/chatAPI";
import { RootStackParamList } from "@/types/navigation";
import { StackNavigationProp } from '@react-navigation/stack';

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface Message {
  id: number;
  content: string;
  sent_at: string;
  userId: number;
  userName: string;
  is_read?: boolean;
}

interface RouteParams {
  chatId: number;
  chatName: string;
  currentUser: User;
  otherUser: User;
}

const ChatScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { chatId, chatName, currentUser, otherUser } = route.params as RouteParams;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const messages = await chatAPI.getMessages(chatId, currentUser.id);
      setMessages(messages);
      setLoading(false);
      await chatAPI.markChatAsRead(chatId, currentUser.id);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => {
      clearInterval(interval);
      chatAPI.markChatAsRead(chatId, currentUser.id);
    };
  }, [chatId, currentUser.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
  
    try {
      await chatAPI.sendMessage({
        userId: currentUser.id,
        chatId,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: otherUser.avatar }} style={styles.headerAvatar} />
        <Text style={styles.headerName}>{otherUser.name}</Text>
      </View>

      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        ref={scrollView => scrollView?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => {
          const isMyMessage = message.userId === currentUser.id;
          return (
            <View 
              key={message.id} 
              style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessage : styles.theirMessage,
                !message.is_read && !isMyMessage && styles.unreadMessage
              ]}
            >
              {!isMyMessage && (
                <Image 
                  source={{ uri: otherUser.avatar }} 
                  style={styles.messageAvatar} 
                />
              )}
              <View style={styles.messageContent}>
                {!isMyMessage && (
                  <Text style={styles.senderName}>{otherUser.name}</Text>
                )}
                <Text style={[
                  styles.messageText,
                  isMyMessage ? styles.myMessageText : styles.theirMessageText
                ]}>
                  {message.content}
                </Text>
                <Text style={styles.messageTime}>
                  {new Date(message.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  {!isMyMessage && !message.is_read && (
                    <Text style={styles.unreadIndicator}> • Oläst</Text>
                  )}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Skriv ett meddelande..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Skicka</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  messageContent: {
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
    padding: 10,
    borderRadius: 15,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  myMessageText: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  theirMessageText: {
    backgroundColor: '#fff',
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  unreadMessage: {
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
    paddingLeft: 7,
  },
  unreadIndicator: {
    color: '#007bff',
    fontSize: 10,
    fontStyle: 'italic',
  },
});

export default ChatScreen;