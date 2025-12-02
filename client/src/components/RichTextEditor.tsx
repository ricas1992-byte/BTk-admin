import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Quote,
  Minus,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useEffect, useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  direction?: 'ltr' | 'rtl';
  'data-testid'?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
  'data-testid'?: string;
}

function ToolbarButton({ onClick, active, disabled, children, title, 'data-testid': testId }: ToolbarButtonProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };
  
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon"
      className={cn('h-8 w-8', active && 'bg-accent')}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      disabled={disabled}
      title={title}
      data-testid={testId}
    >
      {children}
    </Button>
  );
}

interface EditorToolbarProps {
  editor: Editor | null;
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30" data-testid="editor-toolbar">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
        data-testid="toolbar-bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
        data-testid="toolbar-italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline"
        data-testid="toolbar-underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
        data-testid="toolbar-strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
        data-testid="toolbar-h1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
        data-testid="toolbar-h2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
        data-testid="toolbar-h3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
        data-testid="toolbar-bullet-list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
        data-testid="toolbar-ordered-list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
        data-testid="toolbar-align-left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
        data-testid="toolbar-align-center"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
        data-testid="toolbar-align-right"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Quote"
        data-testid="toolbar-quote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="Code Block"
        data-testid="toolbar-code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
        data-testid="toolbar-hr"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
        data-testid="toolbar-undo"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
        data-testid="toolbar-redo"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Start writing...', 
  className,
  direction = 'ltr',
  'data-testid': testId
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none min-h-[50vh] p-4 focus:outline-none',
          direction === 'rtl' && 'text-right',
          'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground',
          'prose-blockquote:border-primary prose-blockquote:text-muted-foreground',
          'prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1',
          'prose-pre:bg-muted prose-pre:text-foreground',
          'prose-li:text-foreground'
        ),
        dir: direction,
        'data-testid': `${testId}-content`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const updateContent = useCallback(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  useEffect(() => {
    updateContent();
  }, [updateContent]);

  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: cn(
              'prose prose-sm dark:prose-invert max-w-none min-h-[50vh] p-4 focus:outline-none',
              direction === 'rtl' && 'text-right',
              'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground',
              'prose-blockquote:border-primary prose-blockquote:text-muted-foreground',
              'prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1',
              'prose-pre:bg-muted prose-pre:text-foreground',
              'prose-li:text-foreground'
            ),
            dir: direction,
            'data-testid': `${testId}-content`,
          },
        },
      });
    }
  }, [direction, editor, testId]);

  return (
    <div 
      className={cn('border rounded-md overflow-hidden bg-background', className)}
      data-testid={testId}
    >
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
