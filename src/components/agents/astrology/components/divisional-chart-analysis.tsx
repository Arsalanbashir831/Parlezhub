'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useAstrologicalInsight } from '@/hooks/useAstrology';
import { analysisTopicTone } from '@/lib/astrology-navigation';

interface DivisionalChartAnalysisProps {
  chartType: string;
  studentId?: string;
  guestProfileId?: string;
}

const CHART_TO_INSIGHT_MAP: Record<string, { category: string; title: string; note: string }> = {
  d2: { category: 'd2_hora', title: 'D2 Hora chart', note: 'Wealth & assets' },
  d4: { category: 'd4_chaturthamsha', title: 'D4 Chaturthamsha chart', note: 'Fortune & property' },
  d7: { category: 'd7_saptamsha', title: 'D7 Saptamsha chart', note: 'Children & lineage' },
  d10: { category: 'd10_dashamsha', title: 'D10 Dashamsha chart', note: 'Career & profession' },
  d12: { category: 'd12_dwadashamsha', title: 'D12 Dwadashamsha chart', note: 'Parents & lineage' },
  d27: { category: 'd27_saptavimshamsha', title: 'D27 Saptavimshamsha chart', note: 'Strengths & weaknesses' },
  d60: { category: 'd60_shashtiamsha', title: 'D60 Shashtiamsha chart', note: 'Past karma & soul' },
};

export default function DivisionalChartAnalysis({
  chartType,
  studentId,
  guestProfileId,
}: DivisionalChartAnalysisProps) {
  const config = CHART_TO_INSIGHT_MAP[chartType];
  const { data, isLoading, isError, isGenerating, isFetching, failureMessage, refetch } =
    useAstrologicalInsight(config ? config.category : '', !!config, studentId, guestProfileId);

  if (!config) return null;
  const tone = analysisTopicTone(config.category);
  const busy = isFetching && !isLoading;

  return (
    <div data-tone={tone} className="obs-glass p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--glass-tone)_35%,transparent)] bg-[color-mix(in_srgb,var(--glass-tone)_14%,transparent)]">
            <Sparkles className="h-4 w-4 text-[var(--glass-tone)]" />
          </span>
          <div>
            <h3 className="text-base font-semibold leading-snug">{config.title}</h3>
            <p className="obs-label mt-1">{config.note} · traditional reading</p>
          </div>
        </div>
        <button className="obs-control gap-2 text-xs" onClick={() => refetch()} disabled={busy}>
          <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
          {busy ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {isLoading ? (
        <p role="status" className="flex min-h-40 items-center justify-center gap-3 text-sm text-muted-foreground">
          <Sparkles className="h-5 w-5 animate-pulse text-[var(--glass-tone)]" aria-hidden="true" />
          Reading this divisional chart…
        </p>
      ) : isGenerating ? (
        <p role="status" className="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin text-[var(--glass-tone)]" aria-hidden="true" />
          This reading is being written. The page checks back every few seconds.
        </p>
      ) : isError || !data ? (
        <div role="alert" className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
          <AlertTriangle className="h-5 w-5 text-[var(--danger)]" aria-hidden="true" />
          <p className="text-sm font-medium">No reading available for this chart</p>
          <p className="obs-muted max-w-md text-xs leading-relaxed">{failureMessage}</p>
        </div>
      ) : (
        <article className="ai-chat-markdown mt-5 max-w-[80ch] text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{data.insight_text}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}
