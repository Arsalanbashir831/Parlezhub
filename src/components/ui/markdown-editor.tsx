'use client';

import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[300px] w-full items-center justify-center rounded border bg-gray-50">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    ),
  }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing your blog content in markdown...',
  height = 400,
}: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center rounded border bg-gray-50">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={height}
        data-color-mode="light"
        textareaProps={{
          placeholder,
          style: {
            fontSize: 14,
            lineHeight: 1.5,
          },
        }}
        preview="edit"
        hideToolbar={false}
        toolbarHeight={40}
      />
    </div>
  );
}
