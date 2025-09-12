'use client';

import '@uiw/react-markdown-preview/markdown.css';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the markdown preview to avoid SSR issues
const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[100px] w-full items-center justify-center rounded border bg-gray-50">
        <div className="text-gray-500">Loading preview...</div>
      </div>
    ),
  }
);

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreviewComponent({
  content,
  className = '',
}: MarkdownPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[100px] w-full items-center justify-center rounded border bg-gray-50">
        <div className="text-gray-500">Loading preview...</div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <MarkdownPreview
        source={content}
        data-color-mode="light"
        style={{
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}
