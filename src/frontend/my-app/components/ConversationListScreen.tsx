import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { useTypedNavigation, useTypedRoute } from '@/hooks/useTypedNavigation';
import { chatAPI } from '@/http/chatAPI';

interface ConversationItem {
  id: number;
  friendId: number;
  friendName: string;
  friendAvatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  hasChat: boolean;
}

const ConversationListScreen = () => {
  const navigation = useTypedNavigation();
  const { params: { currentUser } } = useTypedRoute<'ConversationList'>();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const friends = await chatAPI.getFriends(currentUser.id);
        const conversationsData = await Promise.all(
          friends.map(async (friend) => {
            const chat = await chatAPI.findChatBetweenUsers([currentUser.id, friend.id]);
            if (!chat) {
              return {
                id: 0,
                friendId: friend.id,
                friendName: friend.name,
                friendAvatar: friend.avatar,
                unreadCount: 0,
                hasChat: false
              };
            }
            const [messages, unreadCount] = await Promise.all([
              chatAPI.getMessages(chat.id, currentUser.id),
              chatAPI.getChatUnreadCount(chat.id, currentUser.id)
            ]);
            const lastMessage = messages[messages.length - 1];
            return {
              id: chat.id,
              friendId: friend.id,
              friendName: friend.name,
              friendAvatar: friend.avatar,
              lastMessage: lastMessage?.content,
              lastMessageTime: lastMessage?.sent_at,
              unreadCount: unreadCount || 0,
              hasChat: true
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

  const handleOpenChat = async (item: ConversationItem) => {
    try {
      let chatId = item.id;
      if (!item.hasChat) {
        const newChat = await chatAPI.createChat(item.friendName, [currentUser.id, item.friendId]);
        chatId = newChat.id;
      }
      await chatAPI.markChatAsRead(chatId, currentUser.id);
      navigation.navigate('Messages', {
        chatId,
        chatName: item.friendName,
        currentUser
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
              onPress={() => handleOpenChat(item)}
            >
              <Image
                source={{ uri: item.friendAvatar || `https://i.pravatar.cc/150?u=${item.friendId}` }}
                style={styles.avatar}
              />
              <View style={styles.conversationContent}>
                <Text style={styles.friendName}>{item.friendName}</Text>
                {item.hasChat ? (
                  <>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {item.lastMessage || 'Inga meddelanden än'}
                    </Text>
                    {item.lastMessageTime && (
                      <Text style={styles.messageTime}>
                        {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.startChatText}>Tryck för att chatta</Text>
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
          ListEmptyComponent={<Text style={styles.emptyText}>Inga konversationer än</Text>}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <TouchableOpacity style={styles.newConversationButton} onPress={handleNewConversation}>
          <Text style={styles.newConversationButtonText}>Hitta vänner</Text>
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
  startChatText: {
    color: '#007bff',
    fontSize: 14,
    fontStyle: 'italic',
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
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
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
