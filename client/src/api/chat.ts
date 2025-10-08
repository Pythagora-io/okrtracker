import api from './api';
import { ChatMessage } from '../../../shared/types/user';

// Description: Send a message to LLM about results
// Endpoint: POST /api/chat/results
// Request: { goalId: string, userId: string, message: string }
// Response: { success: boolean, message: ChatMessage }
export const sendChatMessage = async (data: { goalId: string; userId: string; message: string }) => {
  try {
    const response = await api.post('/api/chat/results', data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error sending chat message:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to send chat message');
  }
};

// Description: Get chat history for a goal
// Endpoint: GET /api/chat/results/:goalId
// Request: {}
// Response: { messages: ChatMessage[] }
export const getChatHistory = async (goalId: string) => {
  try {
    const response = await api.get(`/api/chat/results/${goalId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching chat history:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to fetch chat history');
  }
};
