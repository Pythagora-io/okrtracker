import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import chatService from '../services/chatService';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    [key: string]: unknown;
  };
}

// Description: Send a message to LLM about results
// Endpoint: POST /api/chat/results
// Request: { goalId: string, userId: string, message: string }
// Response: { success: boolean, message: ChatMessage }
router.post('/results', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { goalId, userId, message } = req.body;

    // Validate required fields
    if (!goalId || !userId || !message) {
      return res.status(400).json({ error: 'Missing required fields: goalId, userId, and message are required' });
    }

    // Ensure the user is sending a message for themselves
    if (req.user!._id.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to send messages as this user' });
    }

    const assistantMessage = await chatService.sendChatMessage({ goalId, userId, message });
    res.status(200).json({ success: true, message: assistantMessage });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error sending chat message:', errorMessage, errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get chat history for a goal
// Endpoint: GET /api/chat/results/:goalId
// Request: {}
// Response: { messages: Array<ChatMessage> }
router.get('/results/:goalId', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    const messages = await chatService.getChatHistory(goalId);
    res.status(200).json({ messages });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error fetching chat history:', errorMessage, errorStack);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
