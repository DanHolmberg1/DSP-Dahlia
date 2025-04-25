import axios, { AxiosError, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 1000
});

function handleApiError(error: unknown): never {
  if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
    throw new Error('Backend server is not running. Please start the server and try again.');
  }
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const errorData = axiosError.response.data as { message?: string; error?: string };
      const errorMessage = errorData.message || errorData.error || axiosError.response.statusText;
      throw new Error(`API Error: ${axiosError.response.status} - ${errorMessage}`);
    } else if (axiosError.request) {
      throw new Error('Server not responding');
    }
  }
  throw new Error('Unknown API error');
}

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: number;
}

interface Message {
  id: number;
  content: string;
  userId: number;
  userName: string;
  sent_at: string;
}

export const chatAPI = {
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }
      return response.data;
    } catch (error) {
      if ((error as AxiosError).code === 'ECONNREFUSED') {
        throw new Error('Server is offline');
      }
      return handleApiError(error);
    }
  },

  sendMessage: async (userId: number, content: string): Promise<void> => {
    try {
      await api.post('/messages', { userId, content });
    } catch (error) {
      return handleApiError(error);
    }
  },

  getMessages: async (): Promise<Message[]> => {
    try {
      const response: AxiosResponse<Message[]> = await api.get('/messages');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  healthCheck: async (): Promise<{ status: string }> => {
    try {
      const response = await axios.get('http://localhost:3000/health');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};