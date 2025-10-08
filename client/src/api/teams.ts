import api from './api';
import { Team, UserRole } from '../../../shared/types/user';

// Description: Get all teams
// Endpoint: GET /api/teams
// Request: {}
// Response: { teams: Team[] }
export const getTeams = async () => {
  try {
    const response = await api.get('/api/teams');
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Create a new team
// Endpoint: POST /api/teams
// Request: { name: string, managerId: string, icIds: string[] }
// Response: { success: boolean, message: string, team: Team }
export const createTeam = async (data: { name: string; managerId: string; icIds: string[] }) => {
  try {
    const response = await api.post('/api/teams', data);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Update a team
// Endpoint: PUT /api/teams/:id
// Request: { name?: string, managerId?: string, icIds?: string[] }
// Response: { success: boolean, message: string, team: Team }
export const updateTeam = async (id: string, data: { name?: string; managerId?: string; icIds?: string[] }) => {
  try {
    const response = await api.put(`/api/teams/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Get team by ID
// Endpoint: GET /api/teams/:id
// Request: {}
// Response: { team: Team }
export const getTeamById = async (id: string) => {
  try {
    const response = await api.get(`/api/teams/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Get teams for a manager
// Endpoint: GET /api/teams/manager/:managerId
// Request: {}
// Response: { teams: Team[] }
export const getTeamsByManager = async (managerId: string) => {
  try {
    const response = await api.get(`/api/teams/manager/${managerId}`);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Delete a team
// Endpoint: DELETE /api/teams/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteTeam = async (id: string) => {
  try {
    const response = await api.delete(`/api/teams/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};
