import api from './api';
import { User, UserRole } from '../../../shared/types/user';

// Description: Get all users
// Endpoint: GET /api/users
// Request: {}
// Response: { users: User[] }
export const getUsers = async () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        users: [
          {
            _id: '1',
            email: 'admin@example.com',
            role: UserRole.ADMIN,
            name: 'Admin User',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            _id: '2',
            email: 'manager@example.com',
            role: UserRole.MANAGER,
            name: 'Manager User',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            _id: '3',
            email: 'ic1@example.com',
            role: UserRole.IC,
            name: 'IC User 1',
            teamId: '1',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            _id: '4',
            email: 'ic2@example.com',
            role: UserRole.IC,
            name: 'IC User 2',
            teamId: '1',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/users');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Invite a new user
// Endpoint: POST /api/users/invite
// Request: { email: string, role: UserRole, teamId?: string }
// Response: { success: boolean, message: string, user: User }
export const inviteUser = async (data: { email: string; role: UserRole; teamId?: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'User invited successfully',
        user: {
          _id: Math.random().toString(),
          email: data.email,
          role: data.role,
          teamId: data.teamId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post('/api/users/invite', data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get user by ID
// Endpoint: GET /api/users/:id
// Request: {}
// Response: { user: User }
export const getUserById = async (id: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          _id: id,
          email: 'ic1@example.com',
          role: UserRole.IC,
          name: 'IC User 1',
          teamId: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get(`/api/users/${id}`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};