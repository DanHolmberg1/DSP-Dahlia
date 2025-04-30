import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { chatAPI } from "@/http/chatAPI";
import { useAuth } from "@/context/authContext"; 

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface Message {
  id: number;
  content: string;
  sent_at: string;
  user_id: number;
  is_read?: boolean;
}

interface RouteParams {
  chatId?: number;
  otherUser: User;
  currentUser: User;
}

const ChatScreen = () => {
  const route = useRoute();
  const { chatId: initialChatId, otherUser } = route.params as RouteParams & { chatId?: number };
  const { currentUser } = useAuth();
  const [chatId, setChatId] = useState<number | null>(initialChatId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(!initialChatId);
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  // Initiera chatt om den inte finns
  useEffect(() => {
    const initializeChat = async () => {
      if (!initialChatId && currentUser && otherUser) {
        try {
          setInitializing(true);
          const { chatId: newChatId } = await chatAPI.createOrGetChat([
            currentUser.id, 
            otherUser.id
          ]);
          setChatId(newChatId);
          navigation.setParams({ chatId: newChatId } as any);
        } catch (error) {
          console.error('Error initializing chat:', error);
        } finally {
          setInitializing(false);
        }
      }
    };

    initializeChat();
  }, [initialChatId, currentUser, otherUser]);

  const fetchMessages = useCallback(async () => {
    if (!chatId || !currentUser) return;
    
    try {
      const messages = await chatAPI.getMessages(chatId, currentUser.id);
      setMessages(messages);
      
      // Markera som läst ENDAST om det finns olästa meddelanden
      const hasUnread: boolean = messages.some((msg: Message) => 
        !msg.is_read && msg.user_id !== currentUser.id
      );
      
      if (hasUnread) {
        await chatAPI.markChatAsRead(chatId, currentUser.id);
        // Uppdatera lokalt state efter markering
        
        setMessages(prev => prev.map(msg => ({
          ...msg,
          is_read: msg.user_id !== currentUser.id ? true : msg.is_read
        })));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  }, [chatId, currentUser]);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatId, fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId || !currentUser) return;

    const tempId = Date.now(); // Deklarera tempId här
    
    try {
      // Optimistisk uppdatering
      const newMsg = {
        id: tempId,
        content: newMessage,
        sent_at: new Date().toISOString(),
        user_id: currentUser.id,
        is_read: false
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');

      // Skicka meddelande till servern
      await chatAPI.sendMessage({
        userId: currentUser.id,
        chatId,
        content: newMessage
      });

      // Uppdatera med riktigt data från servern
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // Återställ vid fel
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B2D92" />
        <Text>Skapar chatt...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B2D92" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: otherUser.avatar || 'https://i.pravatar.cc/150?u=' + otherUser.id }} 
          style={styles.headerAvatar} 
        />
        <Text style={styles.headerName}>{otherUser.name}</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => {
          if (!currentUser) return null;
          const isMyMessage = message.user_id === currentUser.id;
          const isUnread = !isMyMessage && !message.is_read;
          
          return (
            <View 
              key={message.id} 
              style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessage : styles.theirMessage,
                isUnread && styles.unreadMessage
              ]}
            >
              {!isMyMessage && (
                <Image 
                  source={{ uri: otherUser.avatar || 'https://i.pravatar.cc/150?u=' + otherUser.id }} 
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
                  {isUnread && (
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
          editable={!!chatId}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            !chatId && styles.disabledButton
          ]} 
          onPress={handleSendMessage}
          disabled={!chatId || !newMessage.trim()}
        >
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#1B2D92',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    backgroundColor: '#1B2D92',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
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
    borderLeftColor: '#1B2D92',
    paddingLeft: 7,
  },
  unreadIndicator: {
    color: '#1B2D92',
    fontSize: 10,
    fontStyle: 'italic',
  },
});

export default ChatScreen;