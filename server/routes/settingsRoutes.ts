import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import { ROLES } from 'shared';
import SettingsService from '../services/settingsService';

const router = express.Router();

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

// Description: Get automation settings
// Endpoint: GET /api/settings/automation
// Request: {}
// Response: { settings: AutomationSettings }
router.get('/automation', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    console.log(`Admin ${req.user.email} fetching automation settings`);

    const settings = await SettingsService.get();

    res.status(200).json({ settings });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching automation settings:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Update automation settings
// Endpoint: PUT /api/settings/automation
// Request: { dayOfWeek?: number, hour?: number, minute?: number, timezone?: string }
// Response: { success: boolean, message: string, settings: AutomationSettings }
router.put('/automation', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { dayOfWeek, hour, minute, timezone } = req.body;

    console.log(`Admin ${req.user.email} updating automation settings`);

    const settings = await SettingsService.update({
      dayOfWeek,
      hour,
      minute,
      timezone,
    });

    res.status(200).json({
      success: true,
      message: 'Automation settings updated successfully',
      settings,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating automation settings:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
