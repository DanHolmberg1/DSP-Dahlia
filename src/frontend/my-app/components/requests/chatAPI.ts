// chatAPI.ts
import axios, { AxiosError } from 'axios';

interface Friend {
  id: number;
  name: string;
  email?: string;
  avatar: string;
}

const api = axios.create({
  baseURL: 'http://192.168.0.74:3000', // Removed /api since we're adding /chat prefix to all endpoints
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const errorMessage = (axiosError.response?.data as { error?: string })?.error 
      || axiosError.message
      || `HTTP Error ${axiosError.response?.status}`;
    
    throw new Error(errorMessage);
  }
  
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error('Unknown error occurred');
}

export const chatAPI = {
  getUsers: async () => {
    try {
      const res = await api.get('/chat/users');
      const users = res.data.map((user: any) => ({
        ...user,
        features: Array.isArray(user.features)
          ? user.features
          : typeof user.features === 'string'
          ? JSON.parse(user.features)
          : [],
        avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`
      }));
     
      return users;
    } catch (error) {
      alert('Error: Kunde inte hämta användare');
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getMessages: async (chatId: number, userId: number) => {
    try {
      const res = await api.get(`/chat/messages/${chatId}?userId=${userId}`); // Added /chat prefix
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error('Access denied: User is not a member of this chat');
        }
        if (error.response?.status === 404) {
          throw new Error('User not found');
        }
      }
      throw error;
    }
  },
  
  getFriends: async (userId: number): Promise<Friend[]> => {
    try {
      const res = await api.get(`/chat/users/${userId}/friends`); // Added /chat prefix
      return res.data.map((friend: any) => ({
        ...friend,
        avatar: friend.avatar || `https://i.pravatar.cc/150?u=${friend.id}`
      }));
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  },

  getUserChats: async (userId: number) => {
    try {
      const res = await api.get(`/chat/users/${userId}/chats`); // Added /chat prefix
      return res.data;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      return [];
    }
  },

  getLastMessage: async (chatId: number, userId: number) => {
    try {
      const res = await api.get(`/chat/messages/${chatId}/last?userId=${userId}`); // Added /chat prefix
      return res.data;
    } catch (error) {
      console.error('Error fetching last message:', error);
      return null;
    }
  },

  getAllMessages: async (chatId: number) => {
    try {
      const res = await api.get(`/chat/messages/all/${chatId}`); // Added /chat prefix
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  removeAllChatMembers: async () => {
    try {
      const res = await api.delete('/chat/chat-members/all'); // Added /chat prefix
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteUser: async (userId: number) => {
    try {
      await api.delete(`/chat/users/${userId}`); // Added /chat prefix
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteChat: async (chatId: number) => {
    try {
      await api.delete(`/chat/chats/${chatId}`); // Added /chat prefix
    } catch (error) {
      return handleApiError(error);
    }
  },

  findChatBetweenUsers: async (userIds: number[]) => {
    try {
      const res = await api.post('/chat/chats/find', { userIds }); // Added /chat prefix
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Error finding chat:', error);
      throw error;
    }
  },

  sendMessage: async (data: {
    userId: number;
    chatId: number;
    content: string;
  }) => {
    try {
      if (!data.userId || !data.chatId || !data.content) {
        throw new Error('userId, chatId and content are required');
      }
      
      const res = await api.post('/chat/messages', data); // Added /chat prefix
      return res.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  healthCheck: async () => {
    try {
      const res = await api.get('/chat/health'); // Added /chat prefix
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  createUser: async (name: string, email: string, age: number, sex: number) => {
    try {
      const res = await api.post('/chat/users', { name, email, age, sex }); // Added /chat prefix
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getChats: async () => {
    try {
      const res = await api.get('/chat/chats'); // Added /chat prefix
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  createChat: async (name: string, userIds: number[]) => {
    try {
      const res = await api.post('/chat/chats', { name, userIds }); // Added /chat prefix
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  addUserToChat: async (chatId: number, userId: number) => {
    try {
      await api.post('/chat/chat-members', { chatId, userId }); // Added /chat prefix
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteMessage: async (messageId: number) => {
    try {
      await api.delete(`/chat/messages/${messageId}`); // Added /chat prefix
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return;
      }
      return handleApiError(error);
    }
  },

  deleteAllMessages: async () => {
    try {
      await api.delete('/chat/messages/all'); // Added /chat prefix
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return;
        }
      }
      throw error;
    }
  },

  getTotalUnread: async (userId: number): Promise<number> => {
    try {
      const res = await api.get(`/chat/users/${userId}/unread-total`);
      return res.data.total || 0;
    } catch (error) {
      console.error('Error fetching total unread messages:', error);
      return 0;
    }
  },


  getChatUnreadCount: async (chatId: number, userId: number) => {
    try {
      const res = await api.get(`/chat/chats/${chatId}/unread-count?userId=${userId}`); // Added /chat prefix
      return res.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

 
  
  getOtherChatMember: async (chatId: number, currentUserId: number) => {
    try {
      const res = await api.get(`/chat/chats/${chatId}/other-member?userId=${currentUserId}`); // Added /chat prefix
      return {
        id: res.data.id,
        name: res.data.name,
        avatar: res.data.avatar || `https://i.pravatar.cc/150?u=${res.data.id}`
      };
    } catch (error) {
      console.error('Error getting other chat member:', error);
      return { 
        id: 0, 
        name: 'Okänd', 
        avatar: 'https://i.pravatar.cc/150?u=0' 
      };
    }
  },
  createOrGetChat: async (userIds: number[]): Promise<{ chatId: number }> => {
    try {
      console.log('Creating chat between:', userIds);
      
      // 1. Först försöker vi hitta en befintlig chatt
      try {
        const existingChat = await api.post('/chat/chats/find', { userIds });
        if (existingChat.data) {
          console.log('Found existing chat:', existingChat.data.id);
          return { chatId: existingChat.data.id };
        }
      } catch (findError) {
        // 404 är ok här, det betyder bara att ingen chatt hittades
        if (axios.isAxiosError(findError) && (!findError.response || findError.response.status !== 404)) {
          console.error('Error finding chat:', findError);
          throw findError;
        }
        console.log('No existing chat found (404 response)');
      }
  
      // 2. Om ingen chatt finns, skapa en ny
      console.log('Creating new chat between:', userIds);
      const newChat = await api.post('/chat/chats', { 
        name: `Chat between ${userIds.join(' and ')}`,
        userIds 
      });
      
      if (!newChat.data?.id) {
        throw new Error('Chat created but no ID returned');
      }
      
      console.log('Successfully created new chat with ID:', newChat.data.id);
      return { chatId: newChat.data.id };
    } catch (error) {
      console.error('Failed to create or get chat:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        config: axios.isAxiosError(error) ? error.config : undefined,
        response: axios.isAxiosError(error) ? error.response?.data : undefined,
        status: axios.isAxiosError(error) ? error.response?.status : undefined
      });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error('Kunde inte skapa eller hitta chatt: ' + errorMessage);
    }
  },

  getOtherChatMembers: async (chatId: number, currentUserId: number): Promise<{ id: number; name: string; email?: string; avatar: string }[]> => {
    try {
      const res = await api.get(`/chat/chats/${chatId}/other-members?userId=${currentUserId}`);
      return res.data;
    } catch (error) {
      console.error('Error getting other chat members:', error);
      return [];
    }
  },
  getUnreadCount: async (chatId: number, userId: number): Promise<number> => {
    try {
      const res = await api.get(`/chat/chats/${chatId}/unread-count?userId=${userId}`);
      if (res.data && typeof res.data.count === 'number') {
        return res.data.count;
      }
      console.warn('Invalid unread count response:', res.data);
      return 0;
    } catch (error) {
      console.error('Error fetching unread count for chat', chatId, ':', error);
      return 0;
    }
  },

  markChatAsRead: async (chatId: number, userId: number) => {
    try {
      await api.post(`/chat/chats/${chatId}/mark-read`, { userId });
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  }
};