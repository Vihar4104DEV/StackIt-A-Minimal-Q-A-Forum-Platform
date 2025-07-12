
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smile,
} from 'lucide-react';
import { useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ content, onChange, placeholder = "Start writing...", className = "" }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        placeholder,
      },
    },
  });

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetMark('link').run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setMark('link', { href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertEmoji = useCallback((emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="editor-toolbar flex flex-wrap items-center gap-1 p-2 sm:p-3 bg-gray-50 border-b">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`editor-button h-8 w-8 sm:h-9 sm:w-9 p-0 ${editor.isActive('bold') ? 'active' : ''}`}
            type="button"
          >
            <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`editor-button h-8 w-8 sm:h-9 sm:w-9 p-0 ${editor.isActive('italic') ? 'active' : ''}`}
            type="button"
          >
            <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`editor-button h-8 w-8 sm:h-9 sm:w-9 p-0 ${editor.isActive('strike') ? 'active' : ''}`}
            type="button"
          >
            <Strikethrough className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`editor-button h-8 w-8 sm:h-9 sm:w-9 p-0 ${editor.isActive('bulletList') ? 'active' : ''}`}
            type="button"
          >
            <List className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`editor-button h-8 w-8 sm:h-9 sm:w-9 p-0 ${editor.isActive('orderedList') ? 'active' : ''}`}
            type="button"
          >
            <ListOrdered className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`editor-button h-8 w-8 sm:h-9 sm:w-9 p-0 ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            type="button"
          >
            <AlignLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`editor-button h-8 w-8 sm:h-9 sm:w-9 p-0 ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            type="button"
          >
            <AlignCenter className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`editor-button h-8 w-8 sm:h-9 sm:w-9 p-0 ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            type="button"
          >
            <AlignRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={`editor-button h-8 w-8 sm:h-9 sm:w-9 p-0 ${editor.isActive('link') ? 'active' : ''}`}
            type="button"
          >
            <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={addImage}
            className="editor-button h-8 w-8 sm:h-9 sm:w-9 p-0"
            type="button"
          >
            <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="editor-button h-8 w-8 sm:h-9 sm:w-9 p-0"
            type="button"
          >
            <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {['😀', '😃', '😄', '😁', '🤔', '👍', '❤️', '🎉'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="hover:bg-muted rounded p-1 text-xs sm:text-sm transition-colors"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="min-h-32 p-3 sm:p-4" />
    </div>
  );
};

export default RichTextEditor;
