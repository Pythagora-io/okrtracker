import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, List, ListOrdered, Heading2, MessageSquarePlus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAddComment?: (text: string, position: number) => void;
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
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState(0);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [activeCommentInput, setActiveCommentInput] = useState<string | null>(null);

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
      
      if (text.length > 0 && !readOnly && onAddComment) {
        setSelectedText(text);
        setSelectionPosition(from);
        setShowCommentButton(true);
      } else {
        setShowCommentButton(false);
      }
    }
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleAddComment = () => {
    if (onAddComment && selectedText) {
      onAddComment(selectedText, selectionPosition);
      setShowCommentButton(false);
      editor?.commands.setTextSelection({ from: 0, to: 0 });
      
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to)
      
      const newCommentId = `temp-${from}-${to}`
      setActiveCommentInput(newCommentId)
      
      setTimeout(() => {
        const inputElement = document.querySelector(`[data-comment-input="${newCommentId}"]`)
        if (inputElement instanceof HTMLElement) {
          inputElement.focus()
        }
      }, 100)
    }
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
        "prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none",
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
            onClick={handleAddComment}
            className="shadow-lg"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        </div>
      )}
    </div>
  );
};