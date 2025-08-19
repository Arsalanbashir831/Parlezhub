'use client';

import { useEffect, useRef } from 'react';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichEditor({
  value,
  onChange,
  placeholder,
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string, valueArg?: string) => {
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap gap-2 rounded border bg-white p-2 dark:bg-gray-900">
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => exec('formatBlock', 'P')}
        >
          P
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => exec('formatBlock', 'H1')}
        >
          H1
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => exec('formatBlock', 'H2')}
        >
          H2
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm font-bold"
          onClick={() => exec('bold')}
        >
          B
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm italic"
          onClick={() => exec('italic')}
        >
          I
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm underline"
          onClick={() => exec('underline')}
        >
          U
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => exec('insertOrderedList')}
        >
          OL
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => exec('insertUnorderedList')}
        >
          UL
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => {
            const url = prompt('Enter URL');
            if (url) exec('createLink', url);
          }}
        >
          Link
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => exec('formatBlock', 'BLOCKQUOTE')}
        >
          Quote
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => exec('removeFormat')}
        >
          Clear
        </button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[200px] w-full rounded border bg-white p-3 outline-none dark:bg-gray-900"
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder || 'Start typing...'}
        suppressContentEditableWarning
        style={{ whiteSpace: 'pre-wrap' }}
      />
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
