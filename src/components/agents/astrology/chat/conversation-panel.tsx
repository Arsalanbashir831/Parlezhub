'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, PanelRight, RefreshCw, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAstrologyAIChat } from '@/hooks/useAstrologyAIChat';
import { LoadingLayout, Skeleton, SkeletonText } from '@/components/agents/astrology/ui/observatory-state';
import { chatConversation, chatPromptsFor } from './chat-contexts';
import { cn } from '@/lib/utils';

interface ConversationPanelProps {
  category: string;
  guestId?: string;
  name?: string;
  question?: string;
  className?: string;
  onOpenConversations?: () => void;
}

export default function ConversationPanel({ category, guestId, name, question = '', className, onOpenConversations }: ConversationPanelProps) {
  const [draft, setDraft] = useState(question);
  const { messages, isSending, isLoadingHistory, error, sendMessage, refreshHistory } = useAstrologyAIChat(category, undefined, guestId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversation = chatConversation(category);
  const busy = isSending || isLoadingHistory;

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, isSending]);

  const ask = async (text: string) => {
    if (await sendMessage(text)) setDraft('');
  };

  return <section className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', className)} aria-label="Astrology conversation">
    <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-medium">{conversation?.title ?? category}</h2>
        {name && <p className="mt-0.5 truncate text-xs text-muted-foreground">Chart context: {name}</p>}
      </div>
      {onOpenConversations && <button type="button" onClick={onOpenConversations} className="obs-control shrink-0 gap-2 text-xs xl:hidden"><PanelRight className="h-3.5 w-3.5" />Conversations</button>}
      <button type="button" className="obs-control h-11 w-11 shrink-0 p-0" aria-label="Reload conversation" disabled={busy} onClick={() => refreshHistory()}>
        <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin motion-reduce:animate-none' : ''}`} />
      </button>
    </header>

    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain" role="log" aria-label="Conversation messages" aria-live="polite" aria-busy={isLoadingHistory}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-6 sm:px-6 sm:py-8">
        {isLoadingHistory ? <LoadingLayout label="Loading your conversation…" className="gap-6 py-2">
          <div className="ml-auto max-w-[85%] rounded-3xl border border-border bg-secondary px-5 py-3" aria-hidden="true"><Skeleton className="h-3 w-40 max-w-full" rounded="rounded-md" /></div>
          <div className="flex gap-4" aria-hidden="true"><Skeleton className="h-8 w-8 shrink-0" rounded="rounded-full" /><div className="min-w-0 max-w-[68ch] flex-1"><SkeletonText lines={4} /></div></div>
          <div className="ml-auto max-w-[85%] rounded-3xl border border-border bg-secondary px-5 py-3" aria-hidden="true"><Skeleton className="h-3 w-28 max-w-full" rounded="rounded-md" /></div>
        </LoadingLayout> : messages.length === 0 ? <div className="flex flex-col gap-6 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-[var(--surface-2)]"><Sparkles className="h-5 w-5 text-[var(--solar-gold)]" aria-hidden="true" /></div>
          <div>
            <h3 className="font-serif text-[26px] leading-tight tracking-tight">What would you like to explore about {conversation?.title.toLocaleLowerCase() ?? 'your chart'}?</h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Answers come from the selected birth chart, read against the traditional texts behind this topic.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">{chatPromptsFor(category).map(prompt => <button key={prompt} type="button" disabled={busy} onClick={() => ask(prompt)} className="group flex items-start justify-between gap-3 rounded-2xl border border-border bg-[var(--surface-1)] p-4 text-left text-sm leading-relaxed transition-colors hover:border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)] hover:bg-[var(--surface-2)] disabled:opacity-50">
            <span>{prompt}</span>
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[var(--solar-orange)]" aria-hidden="true" />
          </button>)}</div>
        </div> : messages.map((message, index) => (message.role === 'user'
          ? <p key={message.id || index} className="ml-auto max-w-[85%] whitespace-pre-wrap break-words rounded-3xl border border-border bg-secondary px-5 py-3 text-[15px] leading-relaxed">{message.content}</p>
          : <div key={message.id || index} className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--solar-orange)_25%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_10%,transparent)]"><Sparkles className="h-4 w-4 text-[var(--solar-orange)]" aria-hidden="true" /></div>
            <div className="min-w-0 max-w-[68ch] flex-1"><div className="obs-reading obs-reading-compact"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{message.content}</ReactMarkdown></div></div>
          </div>))}
        {isSending && <div className="flex gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--solar-orange)_25%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_10%,transparent)]" aria-hidden="true"><Sparkles className="h-4 w-4 text-[var(--solar-orange)]" /></div>
          <div className="min-w-0 max-w-[68ch] flex-1">
            <SkeletonText lines={3} className="mb-3" />
            <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><RefreshCw className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />Reading your chart…</p>
          </div>
        </div>}
      </div>
    </div>

    <form className="shrink-0 border-t border-border px-4 py-4 sm:px-6" onSubmit={event => {
      event.preventDefault();
      void ask(draft);
    }}>
      <div className="mx-auto w-full max-w-3xl">
        {error && <p role="alert" className="mb-3 text-sm leading-relaxed text-[var(--danger)]">{error}</p>}
        <label htmlFor={`astrology-question-${category}`} className="sr-only">Your astrology question</label>
        <div className="obs-composer">
          <textarea id={`astrology-question-${category}`} rows={2} maxLength={5000} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void ask(draft);
            }
          }} placeholder="Ask about this topic…" className="min-h-9 min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-[15px] leading-relaxed outline-none caret-[color:var(--solar-orange)] placeholder:text-muted-foreground" disabled={isSending} />
          <button type="submit" aria-label="Send question" disabled={!draft.trim() || busy} className={cn('flex h-9 w-9 shrink-0 self-center items-center justify-center rounded-full transition-[background-color,transform] active:scale-95', draft.trim() ? 'bg-[color:var(--solar-orange)] text-[color:var(--cosmos-950)] hover:bg-[color:var(--solar-gold)]' : 'bg-card text-muted-foreground')}><ArrowUp className="h-4 w-4" aria-hidden="true" /></button>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">AI interpretations can be inaccurate. Chart facts and predictions are not the same; this is not medical, financial, or legal advice.</p>
      </div>
    </form>
  </section>;
}
