import ChatMessage, { IChatMessage } from '../models/ChatMessage';
import Goal from '../models/Goal';
import mongoose from 'mongoose';
import { sendLLMRequest } from './llmService';

class ChatService {
  // Send a chat message and get AI response
  async sendChatMessage(data: {
    goalId: string;
    userId: string;
    message: string;
  }): Promise<IChatMessage> {
    try {
      console.log(`Processing chat message for goal: ${data.goalId}`);

      // Verify the goal exists
      const goal = await Goal.findById(data.goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      // Save user message
      const userMessage = new ChatMessage({
        goalId: new mongoose.Types.ObjectId(data.goalId),
        userId: new mongoose.Types.ObjectId(data.userId),
        role: 'user',
        content: data.message,
      });
      await userMessage.save();
      console.log(`User message saved: ${userMessage._id}`);

      // Get chat history for context
      const chatHistory = await this.getChatHistory(data.goalId);

      // Build context for LLM
      const context = this.buildLLMContext(goal, chatHistory, data.message);

      // Get LLM response
      console.log(`Sending request to LLM for goal: ${data.goalId}`);
      const llmProvider = process.env.LLM_PROVIDER || 'anthropic';
      const llmModel = process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022';
      const aiResponse = await sendLLMRequest(llmProvider, llmModel, context);

      // Save AI response
      const assistantMessage = new ChatMessage({
        goalId: new mongoose.Types.ObjectId(data.goalId),
        userId: new mongoose.Types.ObjectId(data.userId),
        role: 'assistant',
        content: aiResponse,
      });
      await assistantMessage.save();
      console.log(`AI response saved: ${assistantMessage._id}`);

      return assistantMessage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error(`Error processing chat message:`, errorMessage, errorStack);
      throw new Error(`Failed to process chat message: ${errorMessage}`);
    }
  }

  // Get chat history for a goal
  async getChatHistory(goalId: string): Promise<IChatMessage[]> {
    try {
      console.log(`Fetching chat history for goal: ${goalId}`);
      const messages = await ChatMessage.find({ goalId: new mongoose.Types.ObjectId(goalId) })
        .sort({ createdAt: 1 })
        .exec();
      console.log(`Found ${messages.length} chat messages for goal: ${goalId}`);
      return messages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error(`Error fetching chat history:`, errorMessage, errorStack);
      throw new Error(`Failed to fetch chat history: ${errorMessage}`);
    }
  }

  // Build context for LLM request
  private buildLLMContext(goal: { goalsContent: string; resultsContent?: string; weekStart: Date; weekEnd: Date }, chatHistory: IChatMessage[], currentMessage: string): string {
    // Strip HTML tags for cleaner context
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    const goalsText = stripHtml(goal.goalsContent);
    const resultsText = goal.resultsContent ? stripHtml(goal.resultsContent) : 'Not submitted yet';

    let context = `You are an AI assistant helping to analyze weekly goals and results for an OKR (Objectives and Key Results) tracking system.

Week Period: ${goal.weekStart.toDateString()} to ${goal.weekEnd.toDateString()}

Goals for this week:
${goalsText}

Results submitted:
${resultsText}

`;

    // Add chat history if exists
    if (chatHistory.length > 0) {
      context += `\nPrevious conversation:\n`;
      chatHistory.forEach((msg) => {
        context += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    context += `\nUser's current question: ${currentMessage}

Please provide a helpful, insightful response based on the goals and results provided. Focus on:
- Analyzing progress and achievements
- Identifying patterns or areas for improvement
- Providing constructive feedback
- Answering specific questions about the data

Keep your response concise and actionable.`;

    return context;
  }
}

export default new ChatService();
