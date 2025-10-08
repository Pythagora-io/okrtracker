import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, WeekGoal, ChatMessage, Comment, Reply } from '../../../shared/types/user';
import { getUserById } from '@/api/users';
import { getGoalsByUser, saveGoals, addComment, replyToComment, resolveComment } from '@/api/goals';
import { sendChatMessage, getChatHistory } from '@/api/chat';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, Target, FileText } from 'lucide-react';
import { WeekCard } from '@/components/WeekCard';
import { RichTextEditor } from '@/components/RichTextEditor';
import { CommentThread } from '@/components/CommentThread';
import { ChatInterface } from '@/components/ChatInterface';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

export const ManagerICDetail: React.FC = () => {
  const { currentUser } = useAuth();
  const { icId } = useParams<{ icId: string }>();
  const [ic, setIc] = useState<User | null>(null);
  const [goals, setGoals] = useState<WeekGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (icId) {
      loadData();
    }
  }, [icId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, goalsData] = await Promise.all([
        getUserById(icId!),
        getGoalsByUser(icId!)
      ]);
      setIc((userData as { user: User }).user);
      setGoals((goalsData as { goals: WeekGoal[] }).goals);
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoalsChange = async (goalId: string, content: string) => {
    try {
      const goal = goals.find(g => g._id === goalId);
      if (goal) {
        await saveGoals({
          userId: icId!,
          weekStart: goal.weekStart,
          weekEnd: goal.weekEnd,
          goalsContent: content
        });
        setGoals(goals.map(g => g._id === goalId ? { ...g, goalsContent: content } : g));
      }
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleAddComment = async (goalId: string, text: string, position: number) => {
    if (!currentUser) return;

    try {
      const comment = await addComment(goalId, {
        userId: currentUser._id,
        userName: currentUser.name || currentUser.email,
        userRole: currentUser.role,
        text,
        highlightedText: text,
        position
      });

      setGoals(goals.map(g =>
        g._id === goalId
          ? { ...g, comments: [...g.comments, (comment as { comment: Comment }).comment] }
          : g
      ));

      toast({
        title: 'Success',
        description: 'Comment added successfully'
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleReplyToComment = async (goalId: string, commentId: string, text: string) => {
    if (!currentUser) return;

    try {
      const reply = await replyToComment(goalId, commentId, {
        userId: currentUser._id,
        userName: currentUser.name || currentUser.email,
        text
      });

      setGoals(goals.map(g =>
        g._id === goalId
          ? {
              ...g,
              comments: g.comments.map(c =>
                c._id === commentId
                  ? { ...c, replies: [...c.replies, (reply as { reply: Reply }).reply] }
                  : c
              )
            }
          : g
      ));

      toast({
        title: 'Success',
        description: 'Reply added successfully'
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleResolveComment = async (goalId: string, commentId: string) => {
    try {
      await resolveComment(goalId, commentId);

      setGoals(goals.map(g =>
        g._id === goalId
          ? {
              ...g,
              comments: g.comments.map(c =>
                c._id === commentId ? { ...c, resolved: true } : c
              )
            }
          : g
      ));

      toast({
        title: 'Success',
        description: 'Comment resolved successfully'
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleSendChatMessage = async (goalId: string, message: string): Promise<ChatMessage> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const response = await sendChatMessage({
        goalId,
        userId: currentUser._id,
        message
      });
      return (response as { message: ChatMessage }).message;
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ic) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">IC not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{ic.name || ic.email}</h1>
          <p className="text-muted-foreground mt-1">Weekly goals and results</p>
        </div>
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => (
          <WeekCard key={goal._id} goal={goal} defaultExpanded={index === 0}>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Goals</h3>
                </div>
                <RichTextEditor
                  content={goal.goalsContent}
                  onChange={(content) => handleGoalsChange(goal._id, content)}
                  onAddComment={(text, position) => handleAddComment(goal._id, text, position)}
                  placeholder="Set goals for this week..."
                />

                {goal.comments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-3">Comments</h4>
                    <div className="space-y-2">
                      {goal.comments.map((comment) => (
                        <CommentThread
                          key={comment._id}
                          comment={comment}
                          onReply={(commentId, text) => handleReplyToComment(goal._id, commentId, text)}
                          onResolve={(commentId) => handleResolveComment(goal._id, commentId)}
                          currentUserId={currentUser?._id || ''}
                          currentUserName={currentUser?.name || currentUser?.email || ''}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Results</h3>
                </div>
                {goal.resultsContent ? (
                  <>
                    <Textarea
                      value={goal.resultsContent}
                      readOnly
                      className="min-h-[150px] bg-muted/20"
                    />
                    <ChatInterface
                      goalId={goal._id}
                      userId={user?._id || ''}
                      onSendMessage={(message) => handleSendChatMessage(goal._id, message)}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No results submitted yet</p>
                  </div>
                )}
              </div>
            </div>
          </WeekCard>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No goals set yet</p>
        </div>
      )}
    </div>
  );
};