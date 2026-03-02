'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

import { AnalysisTopic } from './content';

interface AnalysisViewProps {
  topic: AnalysisTopic;
  onBack: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ topic, onBack }) => {
  return (
    <div className="flex h-full flex-col bg-[#fffdfa] duration-700 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200/60 p-8 pt-6">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900">
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
          Back to Dashboard
        </button>
      </div>

      {/* Content Body */}
      <div className="flex flex-1 gap-12 overflow-hidden p-8">
        {/* Left Column: Main Analysis Text */}
        <ScrollArea className="flex-1 pr-8">
          <div className="prose prose-slate prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-800 max-w-none">
            {/* Split content by markdown bits for basic rendering or use a markdown parser if available. 
                For now, we'll manually format the structure to match the user's specific text. 
            */}
            <div className="space-y-8 whitespace-pre-wrap leading-relaxed text-slate-600">
              <div className="rounded-3xl border border-slate-200/60 bg-white/40 p-10 shadow-sm backdrop-blur-sm">
                {topic.mainContent
                  .trim()
                  .split('\n')
                  .map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return (
                        <h2
                          key={idx}
                          className="mb-6 font-serif text-3xl font-bold text-slate-900"
                        >
                          {line.replace('# ', '')}
                        </h2>
                      );
                    }
                    if (line.startsWith('## ')) {
                      return (
                        <h3
                          key={idx}
                          className="mb-4 mt-12 font-serif text-2xl font-bold text-slate-900"
                        >
                          {line.replace('## ', '')}
                        </h3>
                      );
                    }
                    if (line.trim() === '---') {
                      return (
                        <hr key={idx} className="my-10 border-slate-200/60" />
                      );
                    }
                    if (line.startsWith('* ')) {
                      return (
                        <div key={idx} className="mb-2 ml-4 flex gap-3">
                          <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                          <p>{line.replace('* ', '')}</p>
                        </div>
                      );
                    }
                    if (line.startsWith('**')) {
                      const parts = line.split('**');
                      return (
                        <p key={idx} className="mb-4">
                          {parts.map((part, i) =>
                            i % 2 === 1 ? (
                              <strong key={i} className="text-slate-900">
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    }
                    return (
                      <p key={idx} className="mb-4">
                        {line}
                      </p>
                    );
                  })}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Right Column: Topic Context */}
        <aside className="w-80 space-y-8 delay-300 duration-1000 animate-in slide-in-from-right-8">
          <div className="rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-md">
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Topic Context
            </h4>

            <div className="space-y-4">
              {topic.contexts.map((ctx, idx) => (
                <div
                  key={idx}
                  className="group cursor-default rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:shadow-primary-500/5"
                >
                  <h5
                    className={cn(
                      'mb-2 text-xs font-bold uppercase tracking-wider transition-colors',
                      ctx.color === 'blue' &&
                        'text-blue-600 group-hover:text-blue-700',
                      ctx.color === 'purple' &&
                        'text-purple-600 group-hover:text-purple-700',
                      ctx.color === 'orange' &&
                        'text-orange-600 group-hover:text-orange-700',
                      ctx.color === 'red' &&
                        'text-red-600 group-hover:text-red-700'
                    )}
                  >
                    {ctx.title}
                  </h5>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    {ctx.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border-l-[3px] border-primary-500 bg-slate-900 p-6 shadow-xl shadow-slate-900/10 transition-transform hover:scale-[1.02]">
            <p className="relative z-10 font-serif text-sm italic leading-relaxed text-slate-200">
              &quot;{topic.quote}&quot;
            </p>
            {/* Subtle light effect in dark quote card */}
            <div className="absolute right-0 top-0 h-32 w-32 bg-primary-500/10 blur-[60px]" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AnalysisView;
