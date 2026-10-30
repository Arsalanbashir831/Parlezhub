'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ANALYSIS_TOPICS } from '@/constants/astrology';
import { useAstrologyAIChat } from '@/hooks/useAstrologyAIChat';
import { cn } from '@/lib/utils';

export const CHAT_CONTEXTS = [
  { id: 'divisional-charts', title: 'Birth and divisional charts' },
  { id: 'dasha', title: 'Dasha periods' },
  { id: 'navatara', title: 'Navatara' },
  ...ANALYSIS_TOPICS.filter(topic => !['charts', 'navatara'].includes(topic.id)).map(topic => ({ id: topic.id, title: topic.title })),
];

const SUGGESTED_QUESTIONS = [
  'Explain my birth chart in simple terms.',
  'Help me understand my current Dasha.',
  'What are the traditional career indicators in my chart?',
];

interface ConversationPanelProps {
  category: string;
  guestId?: string;
  name?: string;
  question?: string;
  className?: string;
}

export default function ConversationPanel({ category, guestId, name, question = '', className }: ConversationPanelProps) {
  const [draft, setDraft] = useState(question);
  const { messages, isSending, isLoadingHistory, error, sendMessage, refreshHistory } = useAstrologyAIChat(category, undefined, guestId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const contextTitle = CHAT_CONTEXTS.find(context => context.id === category)?.title ?? category;

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, isSending]);

  return <section className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', className)} aria-label="Astrology conversation">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-medium">Conversation</h2>
        <p className="mt-1 truncate text-xs text-muted-foreground">Chart context: {name ? `${name} · ` : ''}{contextTitle}</p>
      </div>
      <button className="obs-control shrink-0 gap-2 text-xs" disabled={isSending || isLoadingHistory} onClick={() => refreshHistory()}>
        <RefreshCw className={`h-3.5 w-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />Refresh
      </button>
    </div>

    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6" role="log" aria-label="Conversation messages" aria-live="polite" aria-busy={isLoadingHistory}>
      {isLoadingHistory ? <p role="status" className="py-10 text-center text-sm text-muted-foreground">Loading your conversation…</p> : messages.length === 0 ? <div className="flex min-h-48 flex-col items-start justify-center gap-4">
        <Sparkles className="h-7 w-7 text-[var(--solar-gold)]" aria-hidden="true" />
        <h3 className="text-lg font-medium">Ask about anything on this page.</h3>
        <p className="obs-muted max-w-xl text-sm leading-relaxed">Questions are answered against the selected profile’s own chart data.</p>
        <div className="flex flex-wrap gap-2">{SUGGESTED_QUESTIONS.map(text => <button key={text} className="obs-control text-left text-xs" onClick={() => { setDraft(text); inputRef.current?.focus(); }}>{text}</button>)}</div>
      </div> : <div className="space-y-6">{messages.map((message, index) => <article key={message.id || index} className={message.role === 'user' ? 'ml-auto max-w-2xl rounded-2xl border border-border bg-secondary p-4' : 'max-w-3xl py-1'}>
        <p className="obs-label mb-2">{message.role === 'user' ? 'You' : 'Interpretation'}</p>
        {message.role === 'assistant' ? <div className="obs-reading obs-reading-compact"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{message.content}</ReactMarkdown></div> : <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>}
      </article>)}</div>}
      {isSending && <p role="status" className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Preparing an interpretation…</p>}
    </div>

    <form className="shrink-0 border-t border-border p-4 sm:px-6" onSubmit={async event => {
      event.preventDefault();
      if (await sendMessage(draft)) setDraft('');
    }}>
      {error && <p role="alert" className="mb-3 text-sm leading-relaxed text-[var(--danger)]">{error}</p>}
      <label htmlFor={`astrology-question-${category}`} className="sr-only">Your astrology question</label>
      <div className="flex items-end gap-3 rounded-2xl border border-border bg-secondary p-2">
        <textarea ref={inputRef} id={`astrology-question-${category}`} rows={2} maxLength={5000} value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask a question about this chart…" className="min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground" disabled={isSending} />
        <button type="submit" className="obs-button h-11 w-11 shrink-0 p-0" aria-label="Send question" disabled={!draft.trim() || isSending || isLoadingHistory}><ArrowUp className="h-5 w-5" /></button>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">AI interpretations can be inaccurate. Chart facts and predictions are not the same; this is not medical, financial, or legal advice.</p>
    </form>
  </section>;
}
