import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import { ROLES } from 'shared';
import TeamService from '../services/teamService';

const router = express.Router();

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

// Description: Get all teams
// Endpoint: GET /api/teams
// Request: {}
// Response: { teams: Team[] }
router.get('/', requireUser([ROLES.ADMIN, ROLES.MANAGER]), async (req: AuthRequest, res: Response) => {
  try {
    console.log(`User ${req.user.email} fetching teams`);

    let teams;
    if (req.user.role === ROLES.ADMIN) {
      // Admins can see all teams
      teams = await TeamService.list();
    } else if (req.user.role === ROLES.MANAGER) {
      // Managers can only see their own teams
      teams = await TeamService.getByManager(req.user._id);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json({ teams });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching teams:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get team by ID
// Endpoint: GET /api/teams/:id
// Request: {}
// Response: { team: Team }
router.get('/:id', requireUser([ROLES.ADMIN, ROLES.MANAGER]), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`User ${req.user.email} fetching team ${id}`);

    const team = await TeamService.get(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check permissions: managers can only view their own teams, admins can view all
    if (req.user.role === ROLES.MANAGER && team.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json({ team });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching team:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get teams for a manager
// Endpoint: GET /api/teams/manager/:managerId
// Request: {}
// Response: { teams: Team[] }
router.get('/manager/:managerId', requireUser([ROLES.ADMIN, ROLES.MANAGER]), async (req: AuthRequest, res: Response) => {
  try {
    const { managerId } = req.params;
    console.log(`User ${req.user.email} fetching teams for manager ${managerId}`);

    // Check permissions: managers can only view their own teams
    if (req.user.role === ROLES.MANAGER && req.user._id.toString() !== managerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const teams = await TeamService.getByManager(managerId);

    res.status(200).json({ teams });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching teams by manager:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Create a new team
// Endpoint: POST /api/teams
// Request: { name: string, managerId: string, icIds: string[] }
// Response: { success: boolean, message: string, team: Team }
router.post('/', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { name, managerId, icIds } = req.body;

    if (!name || !managerId) {
      return res.status(400).json({ error: 'Team name and manager ID are required' });
    }

    console.log(`Admin ${req.user.email} creating new team: ${name}`);

    const team = await TeamService.create({
      name,
      managerId,
      icIds: icIds || [],
    });

    res.status(200).json({
      success: true,
      message: 'Team created successfully',
      team,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating team:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Update a team
// Endpoint: PUT /api/teams/:id
// Request: { name?: string, managerId?: string, icIds?: string[] }
// Response: { success: boolean, message: string, team: Team }
router.put('/:id', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, managerId, icIds } = req.body;

    console.log(`Admin ${req.user.email} updating team ${id}`);

    const team = await TeamService.update(id, {
      name,
      managerId,
      icIds,
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      team,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating team:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Delete a team
// Endpoint: DELETE /api/teams/:id
// Request: {}
// Response: { success: boolean, message: string }
router.delete('/:id', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`Admin ${req.user.email} deleting team ${id}`);

    const deleted = await TeamService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting team:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
