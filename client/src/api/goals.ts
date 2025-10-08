import api from './api';
import { WeekGoal, Comment, Reply } from '../../../shared/types/user';

// Description: Get goals for a user
// Endpoint: GET /api/goals/user/:userId
// Request: {}
// Response: { goals: WeekGoal[] }
export const getGoalsByUser = async (userId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const today = new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      
      const lastWeekStart = new Date(currentWeekStart);
      lastWeekStart.setDate(currentWeekStart.getDate() - 7);
      
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(currentWeekStart.getDate() + 7);

      resolve({
        goals: [
          {
            _id: '1',
            userId: userId,
            weekStart: currentWeekStart.toISOString(),
            weekEnd: new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
            goalsContent: '<p>Complete the OKR tracking tool frontend</p><ul><li>Implement user management</li><li>Build rich text editor</li><li>Add commenting functionality</li></ul>',
            resultsContent: '',
            comments: [],
            createdAt: currentWeekStart.toISOString(),
            updatedAt: currentWeekStart.toISOString()
          },
          {
            _id: '2',
            userId: userId,
            weekStart: lastWeekStart.toISOString(),
            weekEnd: new Date(lastWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
            goalsContent: '<p>Research and plan OKR tool architecture</p><ul><li>Define user roles</li><li>Design database schema</li><li>Create wireframes</li></ul>',
            resultsContent: 'Successfully completed all research tasks. Created comprehensive documentation and wireframes. Team approved the architecture design.',
            comments: [
              {
                _id: 'c1',
                userId: '2',
                userName: 'Manager User',
                userRole: 'manager' as any,
                text: 'Great work on the architecture!',
                highlightedText: 'architecture design',
                position: 150,
                replies: [
                  {
                    _id: 'r1',
                    userId: userId,
                    userName: 'IC User 1',
                    text: 'Thank you! I appreciate the feedback.',
                    createdAt: lastWeekStart.toISOString()
                  }
                ],
                resolved: false,
                createdAt: lastWeekStart.toISOString(),
                updatedAt: lastWeekStart.toISOString()
              }
            ],
            createdAt: lastWeekStart.toISOString(),
            updatedAt: lastWeekStart.toISOString()
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get(`/api/goals/user/${userId}`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Save goals for a week
// Endpoint: POST /api/goals
// Request: { userId: string, weekStart: string, weekEnd: string, goalsContent: string }
// Response: { success: boolean, message: string, goal: WeekGoal }
export const saveGoals = async (data: { userId: string; weekStart: string; weekEnd: string; goalsContent: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Goals saved successfully',
        goal: {
          _id: Math.random().toString(),
          userId: data.userId,
          weekStart: data.weekStart,
          weekEnd: data.weekEnd,
          goalsContent: data.goalsContent,
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post('/api/goals', data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Submit results for a week
// Endpoint: POST /api/goals/:id/results
// Request: { resultsContent: string }
// Response: { success: boolean, message: string, goal: WeekGoal }
export const submitResults = async (goalId: string, data: { resultsContent: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Results submitted successfully',
        goal: {
          _id: goalId,
          userId: '3',
          weekStart: new Date().toISOString(),
          weekEnd: new Date().toISOString(),
          goalsContent: '<p>Sample goals</p>',
          resultsContent: data.resultsContent,
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post(`/api/goals/${goalId}/results`, data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Add a comment to goals
// Endpoint: POST /api/goals/:id/comments
// Request: { userId: string, userName: string, userRole: string, text: string, highlightedText: string, position: number }
// Response: { success: boolean, message: string, comment: Comment }
export const addComment = async (goalId: string, data: { userId: string; userName: string; userRole: string; text: string; highlightedText: string; position: number }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Comment added successfully',
        comment: {
          _id: Math.random().toString(),
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole,
          text: data.text,
          highlightedText: data.highlightedText,
          position: data.position,
          replies: [],
          resolved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post(`/api/goals/${goalId}/comments`, data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Reply to a comment
// Endpoint: POST /api/goals/:goalId/comments/:commentId/replies
// Request: { userId: string, userName: string, text: string }
// Response: { success: boolean, message: string, reply: Reply }
export const replyToComment = async (goalId: string, commentId: string, data: { userId: string; userName: string; text: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Reply added successfully',
        reply: {
          _id: Math.random().toString(),
          userId: data.userId,
          userName: data.userName,
          text: data.text,
          createdAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post(`/api/goals/${goalId}/comments/${commentId}/replies`, data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Resolve a comment
// Endpoint: PUT /api/goals/:goalId/comments/:commentId/resolve
// Request: {}
// Response: { success: boolean, message: string }
export const resolveComment = async (goalId: string, commentId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Comment resolved successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put(`/api/goals/${goalId}/comments/${commentId}/resolve`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};