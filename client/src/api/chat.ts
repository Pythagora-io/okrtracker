import api from './api';
import { ChatMessage } from '../../../shared/types/user';

// Description: Send a message to LLM about results
// Endpoint: POST /api/chat/results
// Request: { goalId: string, userId: string, message: string }
// Response: { success: boolean, message: ChatMessage }
export const sendChatMessage = async (data: { goalId: string; userId: string; message: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: {
          _id: Math.random().toString(),
          role: 'assistant',
          content: 'Based on the results submitted, the main accomplishments this week include completing the OKR tracking tool frontend implementation, successfully integrating the rich text editor with commenting functionality, and delivering all planned features on time. The work demonstrates strong technical execution and attention to detail.',
          createdAt: new Date().toISOString()
        }
      });
    }, 1500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post('/api/chat/results', data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get chat history for a goal
// Endpoint: GET /api/chat/results/:goalId
// Request: {}
// Response: { messages: ChatMessage[] }
export const getChatHistory = async (goalId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        messages: []
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get(`/api/chat/results/${goalId}`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};