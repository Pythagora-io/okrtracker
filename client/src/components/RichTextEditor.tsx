import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, List, ListOrdered, Heading2, MessageSquarePlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAddComment?: (text: string, highlightedText: string, position: number) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onAddComment,
  readOnly = false,
  placeholder = 'Start typing...'
}) => {
  const [showCommentButton, setShowCommentButton] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true })
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');

      if (text.length > 0 && !readOnly && onAddComment && !showCommentInput) {
        setSelectedText(text);
        setSelectionPosition(from);
        setShowCommentButton(true);
      } else if (!showCommentInput) {
        setShowCommentButton(false);
      }
    }
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleShowCommentInput = () => {
    setShowCommentButton(false);
    setShowCommentInput(true);
  };

  const handleSubmitComment = () => {
    if (onAddComment && commentText.trim() && selectedText) {
      onAddComment(commentText, selectedText, selectionPosition);
      setShowCommentInput(false);
      setCommentText('');
      setSelectedText('');
      editor?.commands.setTextSelection({ from: 0, to: 0 });
    }
  };

  const handleCancelComment = () => {
    setShowCommentInput(false);
    setCommentText('');
    setShowCommentButton(false);
    editor?.commands.setTextSelection({ from: 0, to: 0 });
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {!readOnly && (
        <div className="flex items-center gap-1 p-2 border-b bg-muted/30 rounded-t-lg">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(editor.isActive('bold') && 'bg-accent')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(editor.isActive('italic') && 'bg-accent')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(editor.isActive('bulletList') && 'bg-accent')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(editor.isActive('orderedList') && 'bg-accent')}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(editor.isActive('heading', { level: 2 }) && 'bg-accent')}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className={cn(
        "prose prose-sm dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none",
        "prose-headings:font-bold prose-h2:text-xl",
        "prose-ul:list-disc prose-ul:pl-6",
        "prose-ol:list-decimal prose-ol:pl-6",
        "prose-li:my-1",
        !readOnly && "border rounded-b-lg bg-background",
        readOnly && "bg-muted/20 rounded-lg"
      )}>
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>

      {showCommentButton && (
        <div className="absolute top-12 right-4 z-10">
          <Button
            type="button"
            size="sm"
            onClick={handleShowCommentInput}
            className="shadow-lg"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        </div>
      )}

      {showCommentInput && (
        <Card className="absolute top-12 right-4 z-10 p-4 w-80 shadow-lg bg-background">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Add Comment</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelComment}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded text-xs italic">
              "{selectedText}"
            </div>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelComment}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
              >
                Post Comment
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};