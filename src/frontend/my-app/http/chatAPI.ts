import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 1000
});

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const errorMessage = (axiosError.response?.data as { error?: string })?.error || axiosError.message;
    throw new Error(errorMessage || 'Unknown API error');
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

  getMessages: async () => {
    try {
      const res = await api.get('/messages');
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  sendMessage: async (userId: number, content: string) => {
    try {
      await api.post('/messages', { userId, content });
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

  // Skapa en ny användare via API
  createUser: async (name: string, email: string, age: number, gender: number) => {
    try {
      const res = await api.post('/users', { name, email, age, gender });
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Skapa en ny chatt via API
  createChat: async (name: string, userIds: number[]) => {
    try {
      const res = await api.post('/chats', { name, userIds });
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};
