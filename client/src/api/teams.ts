import api from './api';
import { Team, UserRole } from '../../../shared/types/user';

// Description: Get all teams
// Endpoint: GET /api/teams
// Request: {}
// Response: { teams: Team[] }
export const getTeams = async () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        teams: [
          {
            _id: '1',
            name: 'Engineering Team',
            managerId: '2',
            managerName: 'Manager User',
            icIds: ['3', '4'],
            ics: [
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
            ],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            _id: '2',
            name: 'Product Team',
            managerId: '2',
            managerName: 'Manager User',
            icIds: [],
            ics: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/teams');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new team
// Endpoint: POST /api/teams
// Request: { name: string, managerId: string, icIds: string[] }
// Response: { success: boolean, message: string, team: Team }
export const createTeam = async (data: { name: string; managerId: string; icIds: string[] }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Team created successfully',
        team: {
          _id: Math.random().toString(),
          name: data.name,
          managerId: data.managerId,
          icIds: data.icIds,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post('/api/teams', data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Update a team
// Endpoint: PUT /api/teams/:id
// Request: { name?: string, managerId?: string, icIds?: string[] }
// Response: { success: boolean, message: string, team: Team }
export const updateTeam = async (id: string, data: { name?: string; managerId?: string; icIds?: string[] }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Team updated successfully',
        team: {
          _id: id,
          name: data.name || 'Engineering Team',
          managerId: data.managerId || '2',
          icIds: data.icIds || ['3', '4'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put(`/api/teams/${id}`, data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get team by ID
// Endpoint: GET /api/teams/:id
// Request: {}
// Response: { team: Team }
export const getTeamById = async (id: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        team: {
          _id: id,
          name: 'Engineering Team',
          managerId: '2',
          managerName: 'Manager User',
          icIds: ['3', '4'],
          ics: [
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
          ],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get(`/api/teams/${id}`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get teams for a manager
// Endpoint: GET /api/teams/manager/:managerId
// Request: {}
// Response: { teams: Team[] }
export const getTeamsByManager = async (managerId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        teams: [
          {
            _id: '1',
            name: 'Engineering Team',
            managerId: managerId,
            managerName: 'Manager User',
            icIds: ['3', '4'],
            ics: [
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
            ],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get(`/api/teams/manager/${managerId}`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};