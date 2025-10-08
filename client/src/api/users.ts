import api from './api';
import { User, UserRole } from '../../../shared/types/user';

// Description: Get all users
// Endpoint: GET /api/users
// Request: {}
// Response: { users: User[] }
export const getUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Invite a new user
// Endpoint: POST /api/users/invite
// Request: { email: string, role: UserRole, teamId?: string }
// Response: { success: boolean, message: string, user: User }
export const inviteUser = async (data: { email: string; role: UserRole; teamId?: string }) => {
  try {
    const response = await api.post('/api/users/invite', data);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Get user by ID
// Endpoint: GET /api/users/:id
// Request: {}
// Response: { user: User }
export const getUserById = async (id: string) => {
  try {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Update user details
// Endpoint: PUT /api/users/:id
// Request: { role?: string, teamId?: string, name?: string }
// Response: { success: boolean, message: string, user: User }
export const updateUser = async (id: string, data: { role?: string; teamId?: string; name?: string }) => {
  try {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Delete a user
// Endpoint: DELETE /api/users/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};
