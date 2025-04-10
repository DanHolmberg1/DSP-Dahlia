import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import MenuBar from "@/components/menuBar";
import { FontAwesome } from '@expo/vector-icons';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatar: string;
}

const MessageMenu = ({ navigation }: { navigation: any }) => {
  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Anna',
      lastMessage: 'Hej! När vill du gå en promenad?',
      time: '12:30',
      unread: true,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: '2',
      name: 'Johan',
      lastMessage: 'Vi kan springa vid 7 imorgon',
      time: '11:45',
      unread: false,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: '3',
      name: 'Maria',
      lastMessage: 'Tack för igår!',
      time: 'Igår',
      unread: false,
      avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Meddelanden</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {conversations.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            style={styles.conversationCard}
            onPress={() => navigation.navigate('Messages', { 
              user: {
                id: conversation.id,
                name: conversation.name,
                avatar: conversation.avatar
              }
            })}
          >
            <Image 
              source={{ uri: conversation.avatar }} 
              style={styles.avatar} 
            />
            <View style={styles.conversationInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{conversation.name}</Text>
                <Text style={styles.time}>{conversation.time}</Text>
              </View>
              <Text 
                style={[
                  styles.lastMessage,
                  conversation.unread && styles.unreadMessage
                ]}
                numberOfLines={1}
              >
                {conversation.lastMessage}
              </Text>
            </View>
            {conversation.unread && (
              <FontAwesome name="circle" size={12} color="#007bff" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

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
    backgroundColor: "white",
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#000',
  },
});

export default MessageMenu;