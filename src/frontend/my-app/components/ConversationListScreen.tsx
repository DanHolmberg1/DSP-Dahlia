import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { chatAPI } from "@/components/requests/chatAPI";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/authContext"; 
import { useFocusEffect } from '@react-navigation/native';

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
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const chats = await chatAPI.getUserChats(currentUser.id);
      
      const conversationsData = await Promise.all(
        chats.map(async (chat: any) => {
          const otherMembers = await chatAPI.getOtherChatMembers(chat.id, currentUser.id);
          const otherUser = otherMembers[0];
          
          const messages = await chatAPI.getMessages(chat.id, currentUser.id);
          const unreadCount = await chatAPI.getUnreadCount(chat.id, currentUser.id);
          console.log(`Chat ${chat.id} has ${unreadCount} unread messages`);
          const lastMessage = messages[messages.length - 1];
          
          return {
            id: chat.id,
            friendId: otherUser.id,
            friendName: otherUser.name,
            friendAvatar: otherUser.avatar || `https://i.pravatar.cc/150?u=${otherUser.id}`,
            lastMessage: lastMessage?.content,
            lastMessageTime: lastMessage?.sent_at,
            unreadCount: unreadCount
          };
        })
      );
      
      // Sortera konversationer med olästa först
      conversationsData.sort((a, b) => b.unreadCount - a.unreadCount);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [currentUser?.id])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadConversations);
    return unsubscribe;
  }, [currentUser?.id, navigation]);

  const handleOpenChat = async (conversation: ConversationItem) => {
    if (!currentUser) return;
    
    // Markera chatt som läst innan navigering
    if (conversation.unreadCount > 0) {
      await chatAPI.markChatAsRead(conversation.id, currentUser.id);
    }
    
    // @ts-ignore
    navigation.navigate('Chat', {
      chatId: conversation.id,
      otherUser: {
        id: conversation.friendId,
        name: conversation.friendName,
        avatar: conversation.friendAvatar
      },
      currentUser
    });
    
    // Uppdatera lokalt state
    setConversations(prev => prev.map(c => 
      c.id === conversation.id ? {...c, unreadCount: 0} : c
    ));
  };

  const handleNewConversation = () => {
    // @ts-ignore
    navigation.navigate('Walk Buddy');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B2D92" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Meddelanden</Text>
        
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.conversationItem, 
                item.unreadCount > 0 && styles.unreadConversation
              ]}
              onPress={() => handleOpenChat(item)}
            >
              <Image
                source={{ uri: item.friendAvatar }}
                style={styles.avatar}
              />
              <View style={styles.conversationContent}>
                <Text style={[
                  styles.friendName,
                  item.unreadCount > 0 && styles.unreadName
                ]}>
                  {item.friendName}
                </Text>
                <Text style={[
                  styles.lastMessage,
                  item.unreadCount > 0 && styles.unreadMessage
                ]} numberOfLines={1}>
                  {item.lastMessage || 'Inga meddelanden än'}
                </Text>
                <View style={styles.bottomRow}>
                  <Text style={styles.messageTime}>
                    {item.lastMessageTime ? 
                      new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                      ''
                    }
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>
                        {item.unreadCount > 9 ? '9+' : item.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Inga konversationer än</Text>
              <Text style={styles.emptySubText}>Tryck på knappen nedan för att hitta personer att chatta med</Text>
            </View>
          }
          refreshing={refreshing}
          onRefresh={loadConversations}
        />
        
        <TouchableOpacity 
          style={styles.newConversationButton} 
          onPress={handleNewConversation}
        >
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1B2D92',
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
    backgroundColor: '#f0f4ff',
    borderLeftWidth: 3,
    borderLeftColor: '#1B2D92',
    paddingLeft: 9,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  friendName: {
    fontWeight: '500',
    fontSize: 16,
    color: '#1B2D92',
    flex: 1,
  },
  unreadName: {
    fontWeight: 'bold',
  },
  unreadIndicatorContainer: {
    backgroundColor: '#E15F18',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    color: '#666',
    fontSize: 14,
    marginBottom: 2,
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#000',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: {
    backgroundColor: '#E15F18',
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
    backgroundColor: '#1B2D92',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newConversationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConversationListScreen;