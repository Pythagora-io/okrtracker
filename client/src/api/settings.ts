import api from './api';
import { AutomationSettings } from '../../../shared/types/user';

// Description: Get automation settings
// Endpoint: GET /api/settings/automation
// Request: {}
// Response: { settings: AutomationSettings }
export const getAutomationSettings = async () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        settings: {
          dayOfWeek: 1, // Monday
          hour: 9,
          minute: 0,
          timezone: 'UTC'
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/settings/automation');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Update automation settings
// Endpoint: PUT /api/settings/automation
// Request: { dayOfWeek: number, hour: number, minute: number, timezone: string }
// Response: { success: boolean, message: string, settings: AutomationSettings }
export const updateAutomationSettings = async (data: AutomationSettings) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Automation settings updated successfully',
        settings: data
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put('/api/settings/automation', data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};