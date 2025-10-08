import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import { ROLES } from 'shared';
import UserService from '../services/userService';
import InviteService from '../services/inviteService';

const router = express.Router();

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

// Description: Get all users
// Endpoint: GET /api/users
// Request: {}
// Response: { users: User[] }
router.get('/', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Admin fetching all users');
    const users = await UserService.list();

    res.status(200).json({ users });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching users:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get user by ID
// Endpoint: GET /api/users/:id
// Request: {}
// Response: { user: User }
router.get('/:id', requireUser([ROLES.ADMIN, ROLES.MANAGER, ROLES.IC]), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Fetching user with ID: ${id}`);

    const user = await UserService.get(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions: users can view their own profile, managers can view their team members, admins can view all
    const requestingUser = req.user;
    if (
      requestingUser.role !== ROLES.ADMIN &&
      requestingUser.role !== ROLES.MANAGER &&
      requestingUser._id.toString() !== id
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json({ user });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching user:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Invite a new user
// Endpoint: POST /api/users/invite
// Request: { email: string, role: string, teamId?: string }
// Response: { success: boolean, message: string, user: User }
router.post('/invite', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { email, role, teamId } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    console.log(`Admin ${req.user.email} inviting user ${email} with role ${role}`);

    const user = await InviteService.createInvite({
      email,
      role,
      teamId,
      invitedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'User invited successfully',
      user,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error inviting user:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Resend invite to a user
// Endpoint: POST /api/users/:id/resend-invite
// Request: {}
// Response: { success: boolean, message: string }
router.post('/:id/resend-invite', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Admin ${req.user.email} resending invite to user ${id}`);

    await InviteService.resendInvite(id);

    res.status(200).json({
      success: true,
      message: 'Invite resent successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error resending invite:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
