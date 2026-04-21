'use client';

import React from 'react';
import { ArrowLeft, ScrollText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface MarkdownPageProps {
  title: string;
  subtitle?: string;
  content: string; 
  icon?: React.ReactNode;
}

export default function MarkdownPage({
  title,
  subtitle,
  content,
  icon,
}: MarkdownPageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-primary-500/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-primary-500/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <Button onClick={() => router.back()} variant="ghost" size="sm" className="gap-2 text-primary-400 hover:bg-primary-500/10">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {icon || <ScrollText className="h-5 w-5 text-primary-500" />}
            <span className="font-serif text-lg font-bold tracking-tight text-primary-200">ParlezHub</span>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight text-primary-100 md:text-5xl">
            {title}
          </h1>
          {subtitle && <p className="text-slate-400">{subtitle}</p>}
        </div>

        <div className="relative rounded-2xl border border-primary-500/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm md:p-12">
          <article className="prose-custom prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: () => null,
                h2: ({ children }) => <h2 className="mt-12 mb-6 font-serif text-2xl font-bold text-primary-300 border-b border-primary-500/20 pb-2 tracking-tight">{children}</h2>,
                p: ({ children }) => <p className="mb-6 leading-relaxed text-slate-300">{children}</p>,
                ul: ({ children }) => <ul className="mb-6 list-outside list-disc space-y-3 pl-6 text-slate-300">{children}</ul>,
                li: ({ children }) => <li className="pl-2">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-primary-400">{children}</strong>,
                em: ({ children }) => <em className="italic text-primary-500/60">{children}</em>,
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>

        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ParlezHub. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
