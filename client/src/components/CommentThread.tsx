import React, { useState } from 'react';
import { Comment as CommentType, Reply } from '../../../shared/types/user';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface CommentThreadProps {
  comment: CommentType;
  onReply: (commentId: string, text: string) => void;
  onResolve: (commentId: string) => void;
  currentUserId: string;
  currentUserName: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  onReply,
  onResolve,
  currentUserId,
  currentUserName
}) => {
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment._id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={cn(
      "p-4 mb-3",
      comment.resolved && "opacity-60 bg-muted"
    )}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {getInitials(comment.userName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-semibold text-sm">{comment.userName}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
              </span>
            </div>
            {!comment.resolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResolve(comment._id)}
                className="text-xs"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}
          </div>
          
          <div className="bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded text-xs mb-2 italic">
            "{comment.highlightedText}"
          </div>
          
          <p className="text-sm mb-3">{comment.text}</p>

          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 space-y-2 mb-3 border-l-2 border-muted pl-3">
              {comment.replies.map((reply: Reply) => (
                <div key={reply._id} className="flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-secondary">
                      {getInitials(reply.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">{reply.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(reply.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm">{reply.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!comment.resolved && (
            <>
              {!showReplyInput ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyInput(true)}
                  className="text-xs"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleReply}>
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowReplyInput(false);
                        setReplyText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}