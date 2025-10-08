import api from './api';
import { WeekGoal, Comment, Reply } from '../../../shared/types/user';

// Description: Get goals for a user
// Endpoint: GET /api/goals/user/:userId
// Request: {}
// Response: { goals: WeekGoal[] }
export const getGoalsByUser = async (userId: string) => {
  try {
    const response = await api.get(`/api/goals/user/${userId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching goals:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to fetch goals');
  }
};

// Description: Save goals for a week
// Endpoint: POST /api/goals
// Request: { userId: string, weekStart: string, weekEnd: string, goalsContent: string }
// Response: { success: boolean, message: string, goal: WeekGoal }
export const saveGoals = async (data: { userId: string; weekStart: string; weekEnd: string; goalsContent: string }) => {
  try {
    const response = await api.post('/api/goals', data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error saving goals:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to save goals');
  }
};

// Description: Submit results for a week
// Endpoint: POST /api/goals/:id/results
// Request: { resultsContent: string }
// Response: { success: boolean, message: string, goal: WeekGoal }
export const submitResults = async (goalId: string, data: { resultsContent: string }) => {
  try {
    const response = await api.post(`/api/goals/${goalId}/results`, data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error submitting results:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to submit results');
  }
};

// Description: Add a comment to goals
// Endpoint: POST /api/goals/:id/comments
// Request: { userId: string, userName: string, userRole: string, text: string, highlightedText: string, position: number }
// Response: { success: boolean, message: string, comment: Comment }
export const addComment = async (goalId: string, data: { userId: string; userName: string; userRole: string; text: string; highlightedText: string; position: number }) => {
  try {
    const response = await api.post(`/api/goals/${goalId}/comments`, data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error adding comment:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to add comment');
  }
};

// Description: Reply to a comment
// Endpoint: POST /api/goals/:goalId/comments/:commentId/replies
// Request: { userId: string, userName: string, text: string }
// Response: { success: boolean, message: string, reply: Reply }
export const replyToComment = async (goalId: string, commentId: string, data: { userId: string; userName: string; text: string }) => {
  try {
    const response = await api.post(`/api/goals/${goalId}/comments/${commentId}/replies`, data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error adding reply:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to add reply');
  }
};

// Description: Resolve a comment
// Endpoint: PUT /api/goals/:goalId/comments/:commentId/resolve
// Request: {}
// Response: { success: boolean, message: string }
export const resolveComment = async (goalId: string, commentId: string) => {
  try {
    const response = await api.put(`/api/goals/${goalId}/comments/${commentId}/resolve`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error resolving comment:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to resolve comment');
  }
};
