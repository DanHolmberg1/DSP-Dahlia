import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';
import { chatAPI } from './http/chatAPI';
import { useTypedNavigation, useTypedRoute } from '@/hooks/useTypedNavigation';

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface ConversationItem {
  id: number;
  friendId: number;
  friendName: string;
  friendAvatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

const ConversationListScreen = () => {
  const navigation = useTypedNavigation();
  const { params: { currentUser } } = useTypedRoute<'ConversationList'>();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const chats = await chatAPI.getUserChats(currentUser.id);
        
        const conversationsData = await Promise.all(
          chats.map(async (chat: any) => {
            const otherUser = await chatAPI.getOtherChatMember(chat.id, currentUser.id);
            
            const [messages, unreadCount] = await Promise.all([
              chatAPI.getMessages(chat.id, currentUser.id),
              chatAPI.getChatUnreadCount(chat.id, currentUser.id)
            ]);
            
            const lastMessage = messages[messages.length - 1];
            
            return {
              id: chat.id,
              friendId: otherUser.id,
              friendName: otherUser.name,
              friendAvatar: otherUser.avatar,
              lastMessage: lastMessage?.content,
              lastMessageTime: lastMessage?.sent_at,
              unreadCount: unreadCount || 0
            };
          })
        );
        
        setConversations(conversationsData);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
    const unsubscribe = navigation.addListener('focus', loadConversations);
    return unsubscribe;
  }, [currentUser.id, navigation]);

  const handleOpenChat = async (chatId: number, friendName: string, friendId: number, friendAvatar: string) => {
    try {
      await chatAPI.markChatAsRead(chatId, currentUser.id);
      navigation.navigate('Messages', {
        chatId,
        chatName: friendName,
        currentUser,
        otherUser: {
          id: friendId,
          name: friendName,
          avatar: friendAvatar
        }
      });
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const handleNewConversation = () => {
    navigation.navigate('Find Friends', { currentUser });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Meddelanden</Text>
        <FlatList
          data={conversations}
          keyExtractor={(item) => `${item.friendId}-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.conversationItem, item.unreadCount > 0 && styles.unreadConversation]}
              onPress={() => handleOpenChat(item.id, item.friendName, item.friendId, item.friendAvatar)}
            >
              <Image
                source={{ uri: item.friendAvatar }}
                style={styles.avatar}
              />
              <View style={styles.conversationContent}>
                <Text style={styles.friendName}>{item.friendName}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage || 'Inga meddelanden än'}
                </Text>
                {item.lastMessageTime && (
                  <Text style={styles.messageTime}>
                    {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {item.unreadCount > 9 ? '9+' : item.unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Inga konversationer än</Text>
              <Text style={styles.emptySubText}>Tryck på knappen nedan för att hitta personer att chatta med</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <TouchableOpacity style={styles.newConversationButton} onPress={handleNewConversation}>
          <Text style={styles.newConversationButtonText}>Hitta personer att chatta med</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unreadConversation: {
    backgroundColor: '#f5f9ff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
    marginRight: 10,
  },
  friendName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  lastMessage: {
    color: '#666',
    fontSize: 14,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#007bff',
    borderRadius: 50,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
  },
  newConversationButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newConversationButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ConversationListScreen;