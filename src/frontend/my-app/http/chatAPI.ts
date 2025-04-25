// chatAPI.ts
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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
      return res.data;
    } catch (error) {
      return handleApiError(error);
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

  sendMessage: async (userId: number, content: string, chatId: number) => {
    try {
      await api.post('/messages', { userId, content, chatId });
    } catch (error) {
      return handleApiError(error);
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
};
