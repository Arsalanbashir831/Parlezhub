'use client';

import React from 'react';
import { ArrowLeft, ScrollText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import rehypeRaw from 'rehype-raw';

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
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />
      </div>

      <header className="sticky top-0 z-50 border-b border-primary-500/10 bg-background/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <Button onClick={() => router.back()} variant="ghost" size="sm" className="gap-2 text-primary-400 hover:bg-primary-500/10">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {icon || <ScrollText className="h-5 w-5 text-primary-500" />}
            <span className="font-serif text-lg font-bold tracking-tight text-primary-200">Shakti Wheel</span>
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
          <article className="prose prose-invert max-w-none prose-h1:hidden prose-h2:mt-12 prose-h2:mb-6 prose-h2:font-serif prose-h2:text-2xl prose-h2:font-bold prose-h2:text-primary-300 prose-h2:border-b prose-h2:border-primary-500/20 prose-h2:pb-2 prose-h2:tracking-tight prose-p:mb-6 prose-p:leading-relaxed prose-p:text-slate-300 prose-ul:mb-6 prose-ul:list-disc prose-ul:space-y-3 prose-ul:pl-6 prose-ul:text-slate-300 prose-li:pl-2 prose-strong:font-bold prose-strong:text-primary-400 prose-em:italic prose-em:text-primary-500/60">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>

              {content}
            </ReactMarkdown>
          </article>
        </div>

        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Shakti Wheel. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
