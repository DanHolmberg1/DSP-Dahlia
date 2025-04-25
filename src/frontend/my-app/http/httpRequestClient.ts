// src/frontend/my-app/components/httpRequestClient.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/chat';

export const createChat = async (name: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create`, { name });
    return response.data;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const joinChat = async (chatId: number, userId: number) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${chatId}/join`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error joining chat:', error);
    throw error;
  }
};

export const sendMessage = async (chatId: number, userId: number, content: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${chatId}/message`, {
      userId,
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (chatId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${chatId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const getUserChats = async (userId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}/chats`);
    return response.data;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};