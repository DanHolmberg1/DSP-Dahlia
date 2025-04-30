import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import Home from "@/icons/home";
import Profile from "@/icons/profile";
import { chatAPI } from "@/http/chatAPI";
import { useAuth } from "@/context/authContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
interface Props {
  iconFocus?: 'HOME' | 'PROFILE' | 'MESSAGES';
  navigation?: any;
}

const MenuBar = (props: Props) => {
  const { currentUser } = useAuth();
  const [unreadTotal, setUnreadTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchUnreadMessages = async () => {
        if (currentUser?.id) {
          try {
            const total = await chatAPI.getTotalUnread(currentUser.id);
            setUnreadTotal(total);
          } catch (error) {
            console.error('Error fetching total unread:', error);
          }
        }
      };
  
      fetchUnreadMessages(); // Kör direkt när fokus återvänder
  
      return () => {
        // Optional: du kan rensa något här om du behöver
      };
    }, [currentUser?.id])
  );

  return (
    <View style={{ 
      position: "absolute", 
      zIndex: 50, 
      justifyContent: "center", 
      alignItems: "center", 
      width: '100%', 
      bottom: 0, 
      backgroundColor: "white",
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0'
    }}>
      <View style={{  
        flexDirection: "row", 
        gap: 40, 
        alignItems: "center", 
        justifyContent: "center",
      }}>
        <TouchableOpacity onPress={() => props.navigation.navigate("Home")}>
          <Home isFocused={props.iconFocus == 'HOME'} width={40} height={40}/>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => {
            props.navigation.navigate("ConversationList");
            // Nollställ notisräknaren när man går till meddelanden
            setUnreadTotal(0);
          }}
          style={{
            backgroundColor: props.iconFocus === 'MESSAGES' ? '#1B2D92' : 'transparent',
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <FontAwesome 
            name="comments" 
            size={30} 
            color={props.iconFocus === 'MESSAGES' ? 'white' : '#1B2D92'} 
          />
          
          {/* Notisindikator */}
          {unreadTotal > 0 && (
            <View style={{
              position: 'absolute',
              top: 5,
              right: 5,
              backgroundColor: 'red',
              borderRadius: 10,
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => props.navigation.navigate("Profile")}>
          <Profile isFocused={props.iconFocus == 'PROFILE'} width={40} height={40}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default MenuBar;