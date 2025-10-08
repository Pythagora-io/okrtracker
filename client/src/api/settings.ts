import api from './api';
import { AutomationSettings } from '../../../shared/types/user';

// Description: Get automation settings
// Endpoint: GET /api/settings/automation
// Request: {}
// Response: { settings: AutomationSettings }
export const getAutomationSettings = async () => {
  try {
    const response = await api.get('/api/settings/automation');
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Update automation settings
// Endpoint: PUT /api/settings/automation
// Request: { dayOfWeek: number, hour: number, minute: number, timezone: string }
// Response: { success: boolean, message: string, settings: AutomationSettings }
export const updateAutomationSettings = async (data: AutomationSettings) => {
  try {
    const response = await api.put('/api/settings/automation', data);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};
