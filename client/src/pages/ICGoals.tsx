import React, { useEffect, useState } from 'react';
import { WeekGoal } from '../../../shared/types/user';
import { getGoalsByUser, saveGoals, submitResults, addComment, replyToComment, resolveComment } from '@/api/goals';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { Target, FileText, Save, Send } from 'lucide-react';
import { WeekCard } from '@/components/WeekCard';
import { RichTextEditor } from '@/components/RichTextEditor';
import { CommentThread } from '@/components/CommentThread';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { generateWeeks } from '@/utils/dateUtils';

export const ICGoals: React.FC = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<WeekGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGoals, setSavingGoals] = useState<{ [key: string]: boolean }>({});
  const [submittingResults, setSubmittingResults] = useState<{ [key: string]: boolean }>({});
  const [resultsText, setResultsText] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadGoals();
    }
  }, [currentUser]);

  const loadGoals = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await getGoalsByUser(currentUser._id);
      let goalsData = (data as { goals: WeekGoal[] }).goals;

      // Generate the current week
      const weeks = generateWeeks(1);
      const currentWeek = weeks[0];

      // Check if current week exists in loaded goals
      const hasCurrentWeek = goalsData.some(
        goal => goal.weekStart === currentWeek.start && goal.weekEnd === currentWeek.end
      );

      // If current week doesn't exist, create it
      if (!hasCurrentWeek) {
        await saveGoals({
          userId: currentUser._id,
          weekStart: currentWeek.start,
          weekEnd: currentWeek.end,
          goalsContent: ''
        });

        // Reload goals after creating the current week entry
        const updatedData = await getGoalsByUser(currentUser._id);
        goalsData = (updatedData as { goals: WeekGoal[] }).goals;
      }

      // Sort goals by weekStart descending (newest first)
      const sortedGoals = [...goalsData].sort((a, b) =>
        new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
      );

      setGoals(sortedGoals);

      const resultsMap: { [key: string]: string } = {};
      sortedGoals.forEach((goal: WeekGoal) => {
        resultsMap[goal._id] = goal.resultsContent || '';
      });
      setResultsText(resultsMap);
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

  const handleSaveGoals = async (goalId: string, content: string) => {
    if (!currentUser) return;

    try {
      setSavingGoals({ ...savingGoals, [goalId]: true });
      const goal = goals.find(g => g._id === goalId);
      if (goal) {
        await saveGoals({
          userId: currentUser._id,
          weekStart: goal.weekStart,
          weekEnd: goal.weekEnd,
          goalsContent: content
        });
        setGoals(goals.map(g => g._id === goalId ? { ...g, goalsContent: content } : g));
        toast({
          title: 'Success',
          description: 'Goals saved successfully'
        });
      }
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setSavingGoals({ ...savingGoals, [goalId]: false });
    }
  };

  const handleSubmitResults = async (goalId: string) => {
    try {
      setSubmittingResults({ ...submittingResults, [goalId]: true });
      await submitResults(goalId, { resultsContent: resultsText[goalId] });
      setGoals(goals.map(g =>
        g._id === goalId ? { ...g, resultsContent: resultsText[goalId] } : g
      ));
      toast({
        title: 'Success',
        description: 'Results submitted successfully'
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setSubmittingResults({ ...submittingResults, [goalId]: false });
    }
  };

  const handleAddComment = async (goalId: string, text: string, highlightedText: string, position: number) => {
    if (!currentUser) return;

    try {
      const comment = await addComment(goalId, {
        userId: currentUser._id,
        userName: currentUser.name || currentUser.email,
        userRole: currentUser.role,
        text,
        highlightedText,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Weekly Goals & Results</h1>
        <p className="text-muted-foreground mt-1">Set your goals and track your progress</p>
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
                  onChange={(content) => {
                    setGoals(goals.map(g => g._id === goal._id ? { ...g, goalsContent: content } : g));
                  }}
                  onAddComment={(text, highlightedText, position) => handleAddComment(goal._id, text, highlightedText, position)}
                  placeholder="Set your goals for this week..."
                />

                <div className="mt-3">
                  <Button
                    onClick={() => handleSaveGoals(goal._id, goal.goalsContent)}
                    disabled={savingGoals[goal._id]}
                  >
                    {savingGoals[goal._id] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Goals
                      </>
                    )}
                  </Button>
                </div>

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
                  <Textarea
                    value={goal.resultsContent}
                    readOnly
                    className="min-h-[150px] bg-muted/20"
                  />
                ) : (
                  <>
                    <Textarea
                      value={resultsText[goal._id] || ''}
                      onChange={(e) => setResultsText({ ...resultsText, [goal._id]: e.target.value })}
                      placeholder="Enter your results for this week..."
                      className="min-h-[150px]"
                    />
                    <div className="mt-3">
                      <Button
                        onClick={() => handleSubmitResults(goal._id)}
                        disabled={!resultsText[goal._id]?.trim() || submittingResults[goal._id]}
                      >
                        {submittingResults[goal._id] ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Results
                          </>
                        )}
                      </Button>
                    </div>
                  </>
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