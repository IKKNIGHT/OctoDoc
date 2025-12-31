import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import { FontSize } from '../utils/fontSize';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

const COLORS = [
  '#ffffff', '#8b8b8b', '#e94560', '#ff6b6b', '#feca57',
  '#48dbfb', '#1dd1a1', '#5f27cd', '#ff9ff3', '#54a0ff'
];

const HIGHLIGHT_COLORS = [
  'transparent', '#feca57', '#1dd1a1', '#48dbfb', '#ff6b6b', '#ff9ff3'
];

const FONTS = [
  { name: 'Default', value: '' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Lucida Console', value: 'Lucida Console, monospace' },
  { name: 'Palatino', value: 'Palatino Linotype, serif' },
];

const FONT_SIZES = [
  '8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px', '72px'
];

export default function RichTextEditor({ content, onChange, disabled }: RichTextEditorProps) {
  const [customSize, setCustomSize] = useState('');

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
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      FontFamily,
      FontSize,
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && disabled !== undefined) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleCustomSizeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customSize) {
      const size = customSize.includes('px') ? customSize : `${customSize}px`;
      editor.chain().focus().setFontSize(size).run();
      setCustomSize('');
    }
  };

  const handleFontSizeChange = (size: string) => {
    if (size === '') {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(size).run();
    }
  };

  const handleFontFamilyChange = (font: string) => {
    if (font === '') {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(font).run();
    }
  };

  return (
    <div className="rich-editor">
      <div className="toolbar">
        {/* Font Family */}
        <div className="toolbar-group">
          <select
            className="toolbar-select font-select"
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            value=""
            title="Font Family"
          >
            {FONTS.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-divider" />

        {/* Font Size */}
        <div className="toolbar-group font-size-group">
          <select
            className="toolbar-select size-select"
            onChange={(e) => handleFontSizeChange(e.target.value)}
            value=""
            title="Font Size"
          >
            <option value="">Size</option>
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="size-input"
            placeholder="Custom"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            onKeyDown={handleCustomSizeSubmit}
            title="Enter custom size (e.g., 22px)"
          />
        </div>

        <div className="toolbar-divider" />

        {/* Text Styling */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'active' : ''}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'active' : ''}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'active' : ''}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Headings */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Lists & Blocks */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'active' : ''}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'active' : ''}
            title="Numbered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'active' : ''}
            title="Quote"
          >
            "
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'active' : ''}
            title="Code Block"
          >
            {'</>'}
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Alignment */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
            title="Align Left"
          >
            ≡
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
            title="Align Center"
          >
            ≡
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
            title="Align Right"
          >
            ≡
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Colors */}
        <div className="toolbar-group">
          <div className="color-picker">
            <button type="button" title="Text Color" className="color-btn">
              A
              <span className="color-indicator" style={{ backgroundColor: '#e94560' }} />
            </button>
            <div className="color-dropdown">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                />
              ))}
            </div>
          </div>
          <div className="color-picker">
            <button type="button" title="Highlight" className="color-btn">
              <span className="highlight-icon">H</span>
            </button>
            <div className="color-dropdown">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="color-swatch"
                  style={{ backgroundColor: color === 'transparent' ? '#2a2a4a' : color }}
                  onClick={() =>
                    color === 'transparent'
                      ? editor.chain().focus().unsetHighlight().run()
                      : editor.chain().focus().setHighlight({ color }).run()
                  }
                >
                  {color === 'transparent' && '✕'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="toolbar-divider" />

        {/* Link */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={addLink}
            className={editor.isActive('link') ? 'active' : ''}
            title="Add Link"
          >
            🔗
          </button>
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove Link"
            >
              ✕
            </button>
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Undo/Redo */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            ↩
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            ↪
          </button>
        </div>
      </div>

      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
