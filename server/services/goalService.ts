import Goal, { IGoal, IComment, IReply } from '../models/Goal';
import User from '../models/User';
import mongoose from 'mongoose';
import emailService from './emailService';

class GoalService {
  // Get all goals for a user
  async getGoalsByUser(userId: string): Promise<IGoal[]> {
    try {
      console.log(`Fetching goals for user: ${userId}`);
      const goals = await Goal.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ weekStart: -1 })
        .exec();
      console.log(`Found ${goals.length} goals for user: ${userId}`);
      return goals;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error(`Error fetching goals for user ${userId}:`, errorMessage, errorStack);
      throw new Error(`Failed to fetch goals: ${errorMessage}`);
    }
  }

  // Save or update goals for a week
  async saveGoals(data: {
    userId: string;
    weekStart: string;
    weekEnd: string;
    goalsContent: string;
  }): Promise<IGoal> {
    try {
      console.log(`Saving goals for user: ${data.userId}, week: ${data.weekStart}`);

      const userId = new mongoose.Types.ObjectId(data.userId);
      const weekStart = new Date(data.weekStart);
      const weekEnd = new Date(data.weekEnd);

      // Check if goals already exist for this week
      let goal = await Goal.findOne({ userId, weekStart });

      if (goal) {
        console.log(`Updating existing goals for week: ${data.weekStart}`);
        goal.goalsContent = data.goalsContent;
        goal.updatedAt = new Date();
        await goal.save();
      } else {
        console.log(`Creating new goals for week: ${data.weekStart}`);
        goal = new Goal({
          userId,
          weekStart,
          weekEnd,
          goalsContent: data.goalsContent,
          comments: [],
        });
        await goal.save();
      }

      console.log(`Goals saved successfully for user: ${data.userId}`);
      return goal;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error(`Error saving goals:`, errorMessage, errorStack);
      throw new Error(`Failed to save goals: ${errorMessage}`);
    }
  }

  // Submit goals (marks them as submitted and sends email to manager)
  async submitGoals(goalId: string, userId: string): Promise<IGoal> {
    try {
      console.log(`Submitting goals: ${goalId} for user: ${userId}`);

      const goal = await Goal.findById(goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      if (goal.userId.toString() !== userId) {
        throw new Error('Unauthorized to submit this goal');
      }

      goal.goalsSubmittedAt = new Date();
      goal.updatedAt = new Date();
      await goal.save();

      // Get user and manager info for email
      const user = await User.findById(userId);
      if (user && user.teamId) {
        const team = await mongoose.model('Team').findById(user.teamId);
        if (team) {
          const manager = await User.findById((team as { managerId: mongoose.Types.ObjectId }).managerId);
          if (manager) {
            console.log(`Sending goals submission email to manager: ${manager.email}`);
            await emailService.sendGoalsSubmittedEmail(
              manager.email,
              manager.name || 'Manager',
              user.name || user.email,
              goal.weekStart,
              goal.weekEnd
            );
          }
        }
      }

      console.log(`Goals submitted successfully: ${goalId}`);
      return goal;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error(`Error submitting goals:`, errorMessage, errorStack);
      throw new Error(`Failed to submit goals: ${errorMessage}`);
    }
  }

  // Submit results for a week
  async submitResults(goalId: string, userId: string, resultsContent: string): Promise<IGoal> {
    try {
      console.log(`Submitting results for goal: ${goalId}`);

      const goal = await Goal.findById(goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      if (goal.userId.toString() !== userId) {
        throw new Error('Unauthorized to submit results for this goal');
      }

      goal.resultsContent = resultsContent;
      goal.resultsSubmittedAt = new Date();
      goal.updatedAt = new Date();
      await goal.save();

      // Get user and manager info for email
      const user = await User.findById(userId);
      if (user && user.teamId) {
        const team = await mongoose.model('Team').findById(user.teamId);
        if (team) {
          const manager = await User.findById((team as { managerId: mongoose.Types.ObjectId }).managerId);
          if (manager) {
            console.log(`Sending results submission email to manager: ${manager.email}`);
            await emailService.sendResultsSubmittedEmail(
              manager.email,
              manager.name || 'Manager',
              user.name || user.email,
              goal.weekStart,
              goal.weekEnd
            );
          }
        }
      }

      console.log(`Results submitted successfully for goal: ${goalId}`);
      return goal;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error(`Error submitting results:`, errorMessage, errorStack);
      throw new Error(`Failed to submit results: ${errorMessage}`);
    }
  }

  // Add a comment to a goal
  async addComment(
    goalId: string,
    commentData: {
      userId: string;
      userName: string;
      userRole: string;
      text: string;
      highlightedText: string;
      position: number;
    }
  ): Promise<IComment> {
    try {
      console.log(`Adding comment to goal: ${goalId}`);

      const goal = await Goal.findById(goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      const comment: IComment = {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(commentData.userId),
        userName: commentData.userName,
        userRole: commentData.userRole,
        text: commentData.text,
        highlightedText: commentData.highlightedText,
        position: commentData.position,
        replies: [],
        resolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      goal.comments.push(comment);
      goal.updatedAt = new Date();
      await goal.save();

      // Send email notification to the goal owner (IC) if the commenter is not the owner
      if (goal.userId.toString() !== commentData.userId) {
        const goalOwner = await User.findById(goal.userId);
        const commenter = await User.findById(commentData.userId);
        if (goalOwner && commenter) {
          console.log(`Sending comment notification email to: ${goalOwner.email}`);
          await emailService.sendCommentNotificationEmail(
            goalOwner.email,
            goalOwner.name || 'User',
            commenter.name || commenter.email,
            commentData.text,
            goal.weekStart,
            goal.weekEnd,
            'goal'
          );
        }
      } else {
        // If the IC commented, notify the manager
        const user = await User.findById(goal.userId);
        if (user && user.teamId) {
          const team = await mongoose.model('Team').findById(user.teamId);
          if (team) {
            const manager = await User.findById((team as { managerId: mongoose.Types.ObjectId }).managerId);
            if (manager) {
              console.log(`Sending comment notification email to manager: ${manager.email}`);
              await emailService.sendCommentNotificationEmail(
                manager.email,
                manager.name || 'Manager',
                commentData.userName,
                commentData.text,
                goal.weekStart,
                goal.weekEnd,
                'goal'
              );
            }
          }
        }
      }

      console.log(`Comment added successfully to goal: ${goalId}`);
      return comment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error(`Error adding comment:`, errorMessage, errorStack);
      throw new Error(`Failed to add comment: ${errorMessage}`);
    }
  }

  // Reply to a comment
  async replyToComment(
    goalId: string,
    commentId: string,
    replyData: {
      userId: string;
      userName: string;
      text: string;
    }
  ): Promise<IReply> {
    try {
      console.log(`Adding reply to comment: ${commentId} on goal: ${goalId}`);

      const goal = await Goal.findById(goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      const comment = goal.comments.id(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      const reply: IReply = {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(replyData.userId),
        userName: replyData.userName,
        text: replyData.text,
        createdAt: new Date(),
      };

      comment.replies.push(reply);
      comment.updatedAt = new Date();
      goal.updatedAt = new Date();
      await goal.save();

      // Send email notification to the comment author if the replier is not the author
      if (comment.userId.toString() !== replyData.userId) {
        const commentAuthor = await User.findById(comment.userId);
        const replier = await User.findById(replyData.userId);
        if (commentAuthor && replier) {
          console.log(`Sending reply notification email to: ${commentAuthor.email}`);
          await emailService.sendReplyNotificationEmail(
            commentAuthor.email,
            commentAuthor.name || 'User',
            replier.name || replier.email,
            replyData.text,
            comment.text,
            goal.weekStart,
            goal.weekEnd
          );
        }
      }

      console.log(`Reply added successfully to comment: ${commentId}`);
      return reply;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error(`Error adding reply:`, errorMessage, errorStack);
      throw new Error(`Failed to add reply: ${errorMessage}`);
    }
  }

  // Resolve a comment
  async resolveComment(goalId: string, commentId: string): Promise<void> {
    try {
      console.log(`Resolving comment: ${commentId} on goal: ${goalId}`);

      const goal = await Goal.findById(goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      const comment = goal.comments.id(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      comment.resolved = true;
      comment.updatedAt = new Date();
      goal.updatedAt = new Date();
      await goal.save();

      console.log(`Comment resolved successfully: ${commentId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error(`Error resolving comment:`, errorMessage, errorStack);
      throw new Error(`Failed to resolve comment: ${errorMessage}`);
    }
  }

  // Get a specific goal by ID
  async getGoalById(goalId: string): Promise<IGoal | null> {
    try {
      console.log(`Fetching goal by ID: ${goalId}`);
      const goal = await Goal.findById(goalId);
      return goal;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error(`Error fetching goal by ID:`, errorMessage, errorStack);
      throw new Error(`Failed to fetch goal: ${errorMessage}`);
    }
  }
}

export default new GoalService();
