import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import goalService from '../services/goalService';
import { ROLES } from 'shared';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    [key: string]: unknown;
  };
}

// Description: Get goals for a user
// Endpoint: GET /api/goals/user/:userId
// Request: {}
// Response: { goals: Array<Goal> }
router.get('/user/:userId', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Check authorization: users can only view their own goals, managers can view their team's goals
    if (req.user!.role === ROLES.IC && req.user!._id.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view these goals' });
    }

    const goals = await goalService.getGoalsByUser(userId);
    res.status(200).json({ goals });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error fetching goals:', errorMessage, errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get a specific goal by ID
// Endpoint: GET /api/goals/:goalId
// Request: {}
// Response: { goal: Goal }
router.get('/:goalId', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;
    const goal = await goalService.getGoalById(goalId);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check authorization
    if (req.user!.role === ROLES.IC && goal.userId.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to view this goal' });
    }

    res.status(200).json({ goal });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error fetching goal:', errorMessage, errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Save goals for a week
// Endpoint: POST /api/goals
// Request: { userId: string, weekStart: string, weekEnd: string, goalsContent: string }
// Response: { success: boolean, message: string, goal: Goal }
router.post('/', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, weekStart, weekEnd, goalsContent = '' } = req.body;

    // Validate required fields
    if (!userId || !weekStart || !weekEnd) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check authorization: users can only save their own goals
    if (req.user!._id.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to save goals for this user' });
    }

    const goal = await goalService.saveGoals({ userId, weekStart, weekEnd, goalsContent });
    res.status(200).json({ success: true, message: 'Goals saved successfully', goal });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error saving goals:', errorMessage, errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Submit goals (marks as submitted and sends email to manager)
// Endpoint: POST /api/goals/:goalId/submit
// Request: {}
// Response: { success: boolean, message: string, goal: Goal }
router.post('/:goalId/submit', requireUser([ROLES.IC]), async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;
    const userId = req.user!._id.toString();

    const goal = await goalService.submitGoals(goalId, userId);
    res.status(200).json({ success: true, message: 'Goals submitted successfully', goal });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error submitting goals:', errorMessage, errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Submit results for a week
// Endpoint: POST /api/goals/:goalId/results
// Request: { resultsContent: string }
// Response: { success: boolean, message: string, goal: Goal }
router.post('/:goalId/results', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;
    const { resultsContent } = req.body;

    if (!resultsContent) {
      return res.status(400).json({ error: 'Results content is required' });
    }

    const userId = req.user!._id.toString();
    const goal = await goalService.submitResults(goalId, userId, resultsContent);
    res.status(200).json({ success: true, message: 'Results submitted successfully', goal });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error submitting results:', errorMessage, errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Add a comment to goals
// Endpoint: POST /api/goals/:goalId/comments
// Request: { userId: string, userName: string, userRole: string, text: string, highlightedText: string, position: number }
// Response: { success: boolean, message: string, comment: Comment }
router.post('/:goalId/comments', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;
    const { userId, userName, userRole, text, highlightedText, position } = req.body;

    // Validate required fields
    if (!userId || !userName || !userRole || !text || !highlightedText || position === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure the commenter is the authenticated user
    if (req.user!._id.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to add comment as this user' });
    }

    const comment = await goalService.addComment(goalId, {
      userId,
      userName,
      userRole,
      text,
      highlightedText,
      position,
    });

    res.status(200).json({ success: true, message: 'Comment added successfully', comment });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error adding comment:', errorMessage, errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Reply to a comment
// Endpoint: POST /api/goals/:goalId/comments/:commentId/replies
// Request: { userId: string, userName: string, text: string }
// Response: { success: boolean, message: string, reply: Reply }
router.post('/:goalId/comments/:commentId/replies', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { goalId, commentId } = req.params;
    const { userId, userName, text } = req.body;

    // Validate required fields
    if (!userId || !userName || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure the replier is the authenticated user
    if (req.user!._id.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to add reply as this user' });
    }

    const reply = await goalService.replyToComment(goalId, commentId, {
      userId,
      userName,
      text,
    });

    res.status(200).json({ success: true, message: 'Reply added successfully', reply });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error adding reply:', errorMessage, errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Resolve a comment
// Endpoint: PUT /api/goals/:goalId/comments/:commentId/resolve
// Request: {}
// Response: { success: boolean, message: string }
router.put('/:goalId/comments/:commentId/resolve', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { goalId, commentId } = req.params;

    await goalService.resolveComment(goalId, commentId);
    res.status(200).json({ success: true, message: 'Comment resolved successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error resolving comment:', errorMessage, errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
