import { StackNavigationProp } from '@react-navigation/stack';

export type User = {
    id: number;
    name: string;
    email: string;
    age: number;
    gender: number;
    avatar: string; // Gör avatar obligatorisk
  };

export type RootStackParamList = {
  Start: undefined;
  Login: undefined;
  "Create account": undefined;
  Home: undefined;
  "Generate routes": undefined;
  "Book walk": undefined;
  "Walk Buddy": undefined;
  "Family walk": undefined;
  Profile: undefined;
  "Find Walks": undefined;
  "Walk with destination": undefined;
  "Find Friends": { currentUser: User };
  Messages: { 
    chatId: number; 
    chatName: string; 
    currentUser: User 
  };
  ConversationList: { currentUser: User };
  "Round walk": undefined;
  "Walk with stops": undefined;
};

// Typer för navigation props
export type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Messages'>;
export type ConversationListNavigationProp = StackNavigationProp<RootStackParamList, 'ConversationList'>;
export type DiscoverPeopleNavigationProp = StackNavigationProp<RootStackParamList, 'Find Friends'>;
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;