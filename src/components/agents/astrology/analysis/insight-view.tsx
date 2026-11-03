'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ChevronLeft, MessageSquareText, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ANALYSIS_TOPICS } from '@/constants/astrology';
import { useAstrologicalInsight } from '@/hooks/useAstrology';
import { topicTerms } from '@/lib/astrology-navigation';
import { LoadingLayout, Refreshing, Skeleton } from '@/components/agents/astrology/ui/observatory-state';
import ConversationPanel from '@/components/agents/astrology/chat/conversation-panel';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface InsightViewProps { slug: string; onBack: () => void; studentId?: string; guestProfileId?: string }

/** Prose-shaped placeholder: the reading block keeps its width and rhythm. */
function ReadingSkeleton({ generating }: { generating: boolean }) {
  return <LoadingLayout label={generating ? 'Your interpretation is being written…' : 'Reading your chart positions…'} className="gap-5">
    <Skeleton className="h-4 w-44 max-w-full" rounded="rounded-md" />
    <div className="max-w-[80ch] space-y-3"><Skeleton className="h-3.5 w-full" rounded="rounded-md" /><Skeleton className="h-3.5 w-[97%]" rounded="rounded-md" /><Skeleton className="h-3.5 w-[92%]" rounded="rounded-md" /><Skeleton className="h-3.5 w-[88%]" rounded="rounded-md" /></div>
    <div className="max-w-[80ch] space-y-3"><Skeleton className="h-3.5 w-full" rounded="rounded-md" /><Skeleton className="h-3.5 w-[95%]" rounded="rounded-md" /><Skeleton className="h-3.5 w-[84%]" rounded="rounded-md" /></div>
    <p className="text-xs leading-relaxed text-muted-foreground">{generating ? 'This page checks back every few seconds, so leave it open.' : 'The first visit writes your interpretation; after that it opens instantly.'}</p>
  </LoadingLayout>;
}

export default function InsightView({ slug, onBack, studentId, guestProfileId }: InsightViewProps) {
  const { data, isLoading, isError, isGenerating, isFetching, failureMessage, refetch } = useAstrologicalInsight(slug, true, studentId, guestProfileId);
  const searchParams = useSearchParams();
  const [chatOpen, setChatOpen] = useState(false);
  const topic = ANALYSIS_TOPICS.find(item => item.id === slug);
  const terms = topic ? topicTerms(topic.terms) : [];
  const busy = isFetching && !isLoading;
  const canAsk = !studentId;

  return <div className="space-y-6">
    <header className="relative overflow-hidden">
      <div className="obs-orbit" aria-hidden="true" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <p className="obs-label mb-3">{topic?.category === 'advanced' ? 'Advanced technique' : 'Traditional chart interpretation'}</p>
          <h1 className="obs-title">{topic?.title || 'Astrological insight'}</h1>
          <p className="obs-muted mt-3 text-sm leading-relaxed">{topic?.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canAsk && <Sheet open={chatOpen} onOpenChange={setChatOpen}>
            <SheetTrigger asChild>
              <button type="button" className="obs-control gap-2" aria-expanded={chatOpen}>
                <MessageSquareText className="h-4 w-4" />Ask about this analysis
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full max-w-[560px] flex-col gap-0 border-border bg-[var(--cosmos-900)] p-0 sm:max-w-[560px]">
              <SheetHeader className="border-b border-border py-4 pl-5 pr-12 text-left sm:pl-6">
                <SheetTitle className="text-sm font-semibold">Ask about this analysis</SheetTitle>
                <SheetDescription className="mt-1 text-xs leading-relaxed">
                  Answers are drawn from {topic?.title ?? 'this chart'} and your saved birth details.
                </SheetDescription>
              </SheetHeader>
              <ConversationPanel category={slug} guestId={guestProfileId} question={searchParams.get('question') || ''} />
            </SheetContent>
          </Sheet>}
          <button type="button" className="obs-control obs-accent" onClick={onBack}><ChevronLeft className="h-4 w-4" />All analyses</button>
        </div>
      </div>
      {terms.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-1.5" role="group" aria-label={`Traditional terms in ${topic?.title}`}>
        <span className="obs-label mr-1">Traditional terms</span>
        {terms.map(word => <span key={word} className="obs-chip" data-tone="gold">{word}</span>)}
      </div>}
    </header>

    <div className="obs-card px-5 py-6 sm:px-8 sm:py-9 lg:px-12">
      {isLoading || isGenerating ? <ReadingSkeleton generating={isGenerating} /> : isError || !data ? <div role="alert" className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="h-6 w-6 text-[var(--danger)]" aria-hidden="true" />
        <h2 className="text-lg font-medium">This analysis is unavailable right now</h2>
        <p className="obs-muted max-w-md text-sm leading-relaxed">{failureMessage || 'The interpretation service did not respond. Your birth details and chart are unchanged.'}</p>
        <button type="button" className="obs-control obs-accent mt-2 gap-2" onClick={() => refetch()} disabled={busy}><RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />{busy ? 'Trying again…' : 'Try again'}</button>
      </div> : <>
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <p className="obs-label">Your interpretation</p>
          {busy && <Refreshing label="Refreshing…" />}
        </div>
        <article className="obs-reading"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{data.insight_text}</ReactMarkdown></article>
      </>}
    </div>

    <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">Traditional astrological interpretations are for reflection. They do not constitute medical, financial, or legal advice, and should not be treated as certain predictions.</p>
  </div>;
}
