'use client';

import React from 'react';
import { LEFT_MENU_ITEMS } from '@/constants/astrology';
import { ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { useAstrologicalInsight } from '@/hooks/useAstrology';
import { ScrollArea } from '@/components/ui/scroll-area';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'

interface InsightViewProps {
  slug: string;
  onBack: () => void;
  studentId?: string;
  guestProfileId?: string;
}

const InsightView: React.FC<InsightViewProps> = ({
  slug,
  onBack,
  studentId,
  guestProfileId,
}) => {
  const { data, isLoading, isError } = useAstrologicalInsight(
    slug,
    true,
    studentId,
    guestProfileId
  );

  // Find the matching menu item for title and subtitle context
  const menuItem = LEFT_MENU_ITEMS.find((item) => item.id === slug) || {
    label: 'Astrological Insight',
    icon: '✨',
  };

  return (
    <div className="flex h-full flex-col bg-background duration-700 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-primary-500/20 p-6 pt-6 md:flex-row md:items-center md:p-8">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-2xl font-bold tracking-tight text-primary-500 md:text-4xl">
            <span className="text-3xl md:text-5xl">{menuItem.icon}</span>
            {menuItem.label}
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">
            DEEP COSMIC INSIGHT
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Removed Talk with AI button here, it is now global floating chat */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-400 transition-all hover:bg-primary-500/20 hover:text-primary-300 hover:shadow-sm active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      <ScrollArea className="flex-1">
        <div className="flex flex-1 flex-col gap-6 p-4 md:gap-12 md:p-8">
          <div className="rounded-[24px] border border-primary-500/20 bg-white/5 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] md:rounded-3xl md:p-10">
            {isLoading ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-24 w-24 animate-pulse rounded-full bg-primary-500/10"></div>
                  <Sparkles className="h-12 w-12 animate-pulse text-primary-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xl font-bold text-primary-400">
                    Consulting the Akashic Records
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-primary-100/60">
                    Please wait while our AI divines deep astrological insights
                    tailored to your specific energetic blueprint...
                  </p>
                </div>
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : isError || !data ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-4">
                <div className="rounded-full border border-red-500/20 bg-red-500/10 p-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-center text-sm font-medium text-primary-100/60">
                  Failed to generate insights. The stars may not be aligned
                  right now.
                </p>
                <button
                  onClick={onBack}
                  className="mt-4 rounded-lg bg-primary-500 px-6 py-2 text-xs font-bold uppercase tracking-wider text-primary-950 hover:bg-primary-600"
                >
                  Return
                </button>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl px-2">
                <article className="prose prose-invert max-w-none prose-headings:font-serif prose-h1:mb-12 prose-h1:mt-8 prose-h1:text-center prose-h1:text-3xl prose-h1:font-bold prose-h1:text-primary-500 md:prose-h1:text-4xl prose-h2:mb-10 prose-h2:mt-20 prose-h2:border-l-4 prose-h2:border-primary-500 prose-h2:pl-6 prose-h2:text-2xl prose-h2:font-bold prose-h2:text-primary-400 md:prose-h2:text-3xl prose-h3:mb-6 prose-h3:mt-14 prose-h3:text-xl prose-h3:font-bold prose-h3:text-primary-300 prose-p:my-4 prose-p:text-justify prose-p:text-lg prose-p:font-medium prose-p:leading-relaxed prose-p:text-primary-100/80 md:prose-p:text-left prose-ul:my-8 prose-ul:list-disc prose-ul:space-y-4 prose-ul:pl-2 md:prose-ul:pl-6 prose-li:text-lg prose-li:font-medium prose-li:text-primary-100/90 prose-strong:font-bold prose-strong:text-primary-500 prose-hr:my-12 prose-hr:border-primary-500/10">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {data.insight_text}
                  </ReactMarkdown>
                </article>
              </div>
            )}
          </div>

          {/* Removed inline AI Chat Section here, using global floating chat */}
        </div>
      </ScrollArea>
    </div>
  );
};

export default InsightView;
