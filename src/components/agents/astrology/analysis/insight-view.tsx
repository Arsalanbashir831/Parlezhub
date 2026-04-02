'use client';

import React from 'react';
import { LEFT_MENU_ITEMS } from '@/constants/astrology';
import { ChevronLeft, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { useAstrologicalInsight } from '@/hooks/useAstrology';
import { ScrollArea } from '@/components/ui/scroll-area';

import { AstrologyAIChat } from './astrology-ai-chat';

interface InsightViewProps {
  slug: string;
  onBack: () => void;
  studentId?: string;
}

const InsightView: React.FC<InsightViewProps> = ({
  slug,
  onBack,
  studentId,
}) => {
  const { data, isLoading, isError } = useAstrologicalInsight(
    slug,
    true,
    studentId
  );

  const chatSectionRef = React.useRef<HTMLDivElement>(null);

  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Find the matching menu item for title and subtitle context
  const menuItem = LEFT_MENU_ITEMS.find((item) => item.id === slug) || {
    label: 'Astrological Insight',
    icon: '✨',
  };

  return (
    <div className="flex h-full flex-col bg-[#fffdfa] duration-700 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200/60 p-6 pt-6 md:flex-row md:items-center md:p-8">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
            <span className="text-3xl md:text-5xl">{menuItem.icon}</span>
            {menuItem.label}
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">
            DEEP COSMIC INSIGHT
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!studentId && (
            <button
              onClick={scrollToChat}
              disabled={isLoading || isError || !data}
              className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:shadow-none"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Talk with AI</span>
              <span className="sm:hidden">Chat</span>
            </button>
          )}
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm active:scale-95"
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
          <div className="rounded-[24px] border border-slate-200/60 bg-white/40 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm md:rounded-3xl md:p-10">
            {isLoading ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-24 w-24 animate-ping rounded-full bg-primary-500/10"></div>
                  <Sparkles className="h-12 w-12 animate-pulse text-primary-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xl font-bold text-slate-700">
                    Consulting the Akashic Records
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Please wait while our AI divines deep astrological insights
                    tailored to your specific energetic blueprint...
                  </p>
                </div>
                <Loader2 className="h-6 w-6 animate-spin text-primary-500/50" />
              </div>
            ) : isError || !data ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-red-50 p-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Failed to generate insights. The stars may not be aligned
                  right now.
                </p>
                <button
                  onClick={onBack}
                  className="mt-4 rounded-lg bg-primary-500 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary-600"
                >
                  Return
                </button>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl px-2">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-12 mt-8 font-serif text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-10 mt-20 font-serif text-2xl font-bold leading-snug text-slate-800 md:text-3xl">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-6 mt-14 font-serif text-xl font-bold text-slate-800">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="my-4 text-lg font-medium text-slate-600/90 last:mb-0">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-4 list-none space-y-8">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex gap-2 text-lg font-medium text-slate-600">
                        <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-primary-500/60" />
                        <div>{children}</div>
                      </li>
                    ),
                    hr: () => (
                      <hr className="my-4 border-t border-slate-200/60" />
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-slate-900">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {data.insight_text}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* AI Chat Section - Only visible for the user, not for teachers viewing a student */}
          {!isLoading && !isError && data && !studentId && (
            <div ref={chatSectionRef} className="scroll-mt-10">
              <div className="mx-auto max-w-4xl px-2">
                <div className="relative mb-8 flex items-center justify-center">
                  <div className="absolute h-px w-full bg-slate-200/60" />
                  <div className="relative flex items-center gap-4 bg-[#fffdfa] px-6">
                    <Sparkles className="h-5 w-5 text-primary-400" />
                    <span className="font-serif text-lg font-bold text-slate-400">
                      Deepen Your Understanding
                    </span>
                    <Sparkles className="h-5 w-5 text-primary-400" />
                  </div>
                </div>
              </div>
              <AstrologyAIChat category={slug} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default InsightView;
