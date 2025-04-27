// chatAPI.ts
import axios, { AxiosError } from 'axios';
interface Friend {
  id: number;
  name: string;
  email?: string;
  avatar: string;
}
const api = axios.create({
  baseURL: 'http://192.168.1.131:3000/api',
  timeout: 5000, // Ökad timeout
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
    
    throw new Error(errorMessage); // Kasta alltid ett Error-objekt
  }
  
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error('Unknown error occurred');
}

export const chatAPI = {
  getUsers: async () => {
    try {
      const res = await api.get('/users');
      return res.data.map((user: any) => ({
        ...user,
        features: user.features || [],
        avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getMessages: async (chatId: number, userId: number) => {
    try {
      const res = await api.get(`/messages/${chatId}?userId=${userId}`);
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
      const res = await api.get(`/users/${userId}/friends`);
      return res.data.map((friend: any) => ({
        ...friend,
        avatar: friend.avatar || `https://i.pravatar.cc/150?u=${friend.id}`
      }));
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  },
  getLastMessage: async (chatId: number, userId: number) => {
    try {
      const res = await api.get(`/messages/${chatId}/last?userId=${userId}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching last message:', error);
      return null;
    }
  },
  getAllMessages: async (chatId: number) => {
    try {
      const res = await api.get(`/messages/all/${chatId}`);
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  removeAllChatMembers: async () => {
    try {
      const res = await api.delete('/chat-members/all');
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteUser: async (userId: number) => {
    try {
      await api.delete(`/users/${userId}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteChat: async (chatId: number) => {
    try {
      await api.delete(`/chats/${chatId}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  findChatBetweenUsers: async (userIds: number[]) => {
    try {
      const res = await api.post('/chats/find', { userIds });
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // Returnera null om chatt inte finns istället för att kasta fel
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
      
      const res = await api.post('/messages', data);
      return res.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  healthCheck: async () => {
    try {
      const res = await api.get('/health');
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  createUser: async (name: string, email: string, age: number, gender: number) => {
    try {
      const res = await api.post('/users', { name, email, age, gender });
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getChats: async () => {
    try {
      const res = await api.get('/chats');
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  createChat: async (name: string, userIds: number[]) => {
    try {
      const res = await api.post('/chats', { name, userIds });
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  addUserToChat: async (chatId: number, userId: number) => {
    try {
      await api.post('/chat-members', { chatId, userId });
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteMessage: async (messageId: number) => {
    try {
      await api.delete(`/messages/${messageId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return; // Ignorera "Message not found"
      }
      return handleApiError(error);
    }
  },
  deleteAllMessages: async () => {
    try {
      await api.delete('/messages/all');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return; // Inga meddelanden att ta bort är OK
        }
      }
      throw error; // Kasta vidare andra fel
    }
  },
  getTotalUnread: async (userId: number): Promise<number> => {
    try {
      const res = await api.get(`/users/${userId}/unread-total`);
      return res.data.total;
    } catch (error) {
      console.error('Error fetching total unread:', error);
      return 0;
    }
  },

  markChatAsRead: async (chatId: number, userId: number) => {
    try {
      await api.post(`/chats/${chatId}/mark-read`, { userId });
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  },

  getChatUnreadCount: async (chatId: number, userId: number) => {
    try {
      const res = await api.get(`/chats/${chatId}/unread-count?userId=${userId}`);
      return res.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },
  getUnreadCount: async (userId: number) => {
    try {
      const res = await api.get(`/users/${userId}/unread-total`);
      return res.data.total;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },
};
