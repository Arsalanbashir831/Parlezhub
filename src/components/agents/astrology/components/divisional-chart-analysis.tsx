'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAstrologicalInsight } from '@/hooks/useAstrology';

interface DivisionalChartAnalysisProps {
  chartType: string;
  studentId?: string;
  guestProfileId?: string;
}

const CHART_TO_INSIGHT_MAP: Record<string, { category: string; title: string }> = {
  d2: { category: 'd2_hora', title: 'D2 Hora (Wealth & Assets) Analysis' },
  d4: { category: 'd4_chaturthamsha', title: 'D4 Chaturthamsha (Fortune & Property) Analysis' },
  d7: { category: 'd7_saptamsha', title: 'D7 Saptamsha (Children & Lineage) Analysis' },
  d10: { category: 'd10_dashamsha', title: 'D10 Dashamsha (Career & Profession) Analysis' },
  d12: { category: 'd12_dwadashamsha', title: 'D12 Dwadashamsha (Parents & Lineage) Analysis' },
  d27: { category: 'd27_saptavimshamsha', title: 'D27 Nakshatramsha (Strengths & Weaknesses) Analysis' },
  d60: { category: 'd60_shashtiamsha', title: 'D60 Shashtiamsha (Past Karma & Soul) Analysis' },
};

export default function DivisionalChartAnalysis({
  chartType,
  studentId,
  guestProfileId,
}: DivisionalChartAnalysisProps) {
  const config = CHART_TO_INSIGHT_MAP[chartType];

  // If the chart does not have an associated insight analysis category, do not render anything
  const { data, isLoading, isError } = useAstrologicalInsight(
    config ? config.category : '',
    !!config,
    studentId,
    guestProfileId
  );

  if (!config) return null;

  return (
    <div className="w-full rounded-[24px] border border-primary-500/10 bg-white/5 p-6 shadow-2xl md:rounded-3xl md:p-10 duration-700 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="mb-8 border-b border-primary-500/10 pb-4">
        <h3 className="flex items-center gap-2.5 font-serif text-lg font-bold text-primary-300 md:text-xl">
          <Sparkles className="h-5 w-5 text-primary-500 animate-pulse-slow" />
          {config.title}
        </h3>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-primary-500/70">
          AI generated divisional chart reading
        </p>
      </div>

      {/* Body states */}
      {isLoading ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-16 w-16 animate-pulse rounded-full bg-primary-500/5"></div>
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
          <p className="font-serif text-sm italic text-primary-400">
            Consulting the cosmic alignment records...
          </p>
        </div>
      ) : isError || !data ? (
        <div className="flex min-h-[150px] flex-col items-center justify-center space-y-3 rounded-2xl border border-red-500/10 bg-red-500/5 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <div>
            <h4 className="text-sm font-bold text-red-300">Analysis Unavailable</h4>
            <p className="mt-1 text-xs text-primary-100/60 max-w-md">
              Failed to load insight analysis for this chart. The stars may still be aligning.
            </p>
          </div>
        </div>
      ) : (
        <article className="prose prose-invert max-w-none prose-headings:font-serif prose-h2:mt-10 prose-h2:mb-4 prose-h2:font-serif prose-h2:text-xl prose-h2:font-bold prose-h2:text-primary-300 prose-h2:border-b prose-h2:border-primary-500/10 prose-h2:pb-2 prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-base prose-h3:font-bold prose-h3:text-primary-400 prose-p:mb-4 prose-p:text-sm prose-p:leading-relaxed prose-p:text-primary-100/80 prose-ul:mb-4 prose-ul:list-disc prose-ul:space-y-2 prose-ul:pl-6 prose-li:text-sm prose-li:text-primary-100/90 prose-strong:font-bold prose-strong:text-primary-400 prose-em:italic prose-em:text-primary-500/60">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {data.insight_text}
          </ReactMarkdown>
        </article>
      )}
    </div>
  );
}
