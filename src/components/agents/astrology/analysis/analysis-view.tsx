'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

import { AnalysisTopic, SHARED_CONTEXTS, SHARED_QUOTE } from './content';

interface AnalysisViewProps {
  topic: AnalysisTopic;
  onBack: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ topic, onBack }) => {
  const activeContexts = topic.contexts || SHARED_CONTEXTS;
  const activeQuote = topic.quote || SHARED_QUOTE;

  return (
    <div className="flex h-full flex-col bg-[#fffdfa] duration-700 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200/60 p-6 pt-6 md:flex-row md:items-center md:p-8">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {topic.title}
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">
            {topic.subtitle}
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      {/* Content Body */}
      <ScrollArea className="flex-1">
        <div className="flex flex-1 flex-col gap-8 p-4 md:gap-12 md:p-8 xl:flex-row">
          {/* Left Column: Main Analysis Text using ReactMarkdown */}
          <div className="flex-1">
            <div className="rounded-3xl border border-slate-200/60 bg-white/40 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm md:p-10">
              <ReactMarkdown className="prose prose-slate prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-2xl md:prose-h1:text-3xl prose-h1:mb-6 md:prose-h1:mb-8 prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-8 md:prose-h2:mt-12 prose-h2:mb-4 prose-p:mb-4 md:prose-p:mb-6 prose-p:leading-relaxed prose-p:text-slate-600 prose-strong:font-bold prose-strong:text-slate-800 prose-hr:my-8 md:prose-hr:my-10 prose-hr:border-slate-200/60 prose-ul:list-none prose-ul:pl-0 prose-li:mb-2 prose-li:flex prose-li:gap-3 prose-li:before:mt-2.5 prose-li:before:h-1.5 prose-li:before:w-1.5 prose-li:before:shrink-0 prose-li:before:rounded-full prose-li:before:bg-primary-500 prose-li:before:content-[''] max-w-none">
                {topic.mainContent}
              </ReactMarkdown>
            </div>
          </div>

          {/* Right Column: Topic Context */}
          <aside className="mb-8 w-full space-y-6 delay-300 duration-1000 animate-in slide-in-from-right-8 xl:w-80">
            <div className="rounded-[32px] border border-slate-200/50 bg-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md">
              <h4 className="mb-6 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400/80">
                TOPIC CONTEXT
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
                {activeContexts.map((ctx, idx) => (
                  <div
                    key={idx}
                    className="group cursor-default rounded-2xl border border-blue-50/30 bg-[#f8fbff]/50 p-4 transition-all duration-500 hover:scale-[1.02] hover:bg-white hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]"
                  >
                    <h5
                      className={cn(
                        'mb-1 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors',
                        ctx.color === 'blue' &&
                          'text-blue-500 group-hover:text-blue-600',
                        ctx.color === 'purple' &&
                          'text-[#a855f7] group-hover:text-[#9333ea]',
                        ctx.color === 'orange' &&
                          'text-[#f97316] group-hover:text-[#ea580c]',
                        ctx.color === 'red' &&
                          'text-red-500 group-hover:text-red-600'
                      )}
                    >
                      {ctx.title}
                    </h5>
                    <p className="text-[12px] font-medium leading-[1.5] text-slate-500/90">
                      {ctx.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[32px] border-l-[4px] border-primary-500 bg-white p-6 shadow-2xl shadow-slate-900/20 transition-all duration-700 hover:-translate-y-1 hover:shadow-primary-500/10">
              <div className="relative z-10">
                <span className="block font-serif text-3xl text-primary-500/40">
                  “
                </span>
                <p className="font-serif text-sm italic leading-[1.5] text-black">
                  {activeQuote}
                </p>
                <span className="mt-1 block text-right font-serif text-3xl text-primary-500/40">
                  ”
                </span>
              </div>
              {/* Subtle light effect in dark quote card */}
              <div className="absolute -right-10 -top-10 h-32 w-32 bg-primary-500/15 opacity-60 blur-[60px] transition-opacity duration-700 group-hover:opacity-100" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-orange-500/10 opacity-40 blur-[60px] transition-opacity duration-700 group-hover:opacity-100" />
            </div>
          </aside>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AnalysisView;
