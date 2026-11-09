'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { ChevronRight, Clock, Globe2, History, Mic, Search } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { tutorLanguageLabel } from '@/constants/tutor';
import { learnerTurns, useVoiceConversations } from '@/hooks/useVoiceConversations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  buttonStyles,
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonBlock,
  StatCard,
} from '@/components/parlezhub/ui';
import { TranscriptSheet } from '@/components/parlezhub/history/transcript-sheet';

const ALL = 'all';

/** /parlezhub/history — every saved AI tutor conversation, with transcripts. */
export default function HistoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { conversations, totals, isLoading, error, refetch } = useVoiceConversations();
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState(ALL);

  // The open transcript lives in the URL, so it survives a reload and the
  // tutor's summary can link straight to it.
  const openId = searchParams.get('id');
  const open = conversations.find((conversation) => String(conversation.id) === openId) ?? null;
  const setOpen = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('id', id);
    else params.delete('id');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const languages = useMemo(
    () => [...new Set(conversations.map((c) => c.target_language))].filter(Boolean),
    [conversations]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter(
      (conversation) =>
        (language === ALL || conversation.target_language === language) &&
        (!q || (conversation.topic ?? '').toLowerCase().includes(q))
    );
  }, [conversations, language, query]);

  const newConversation = (
    <Link href={ROUTES.PARLEZHUB.TUTOR} className={buttonStyles.primary}>
      <Mic className="h-4 w-4" aria-hidden="true" />
      New conversation
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Language Tutor"
        title="Conversation history"
        description="Every practice conversation with your tutor, with the full transcript."
        actions={newConversation}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={History} label="Conversations" value={totals.count} isLoading={isLoading} />
        <StatCard icon={Clock} label="Minutes practised" value={totals.minutes} isLoading={isLoading} />
        <StatCard icon={Globe2} label="Languages" value={totals.languages} isLoading={isLoading} />
      </div>

      {error && conversations.length === 0 ? (
        <ErrorState
          title="Your history could not be loaded"
          body="Your conversations are safe. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-2" aria-label="Loading conversations">
          {[0, 1, 2].map((row) => (
            <SkeletonBlock key={row} className="h-[4.5rem]" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={Mic}
          title="No conversations yet"
          body="Your first practice session will show up here, with its full transcript."
          action={newConversation}
        />
      ) : (
        <section aria-label="Conversations" className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search by topic</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by topic"
                className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              />
            </label>
            {languages.length > 1 && (
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-11 rounded-full bg-card sm:w-52" aria-label="Filter by language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={ALL}>All languages</SelectItem>
                  {languages.map((code) => {
                    const { flag, label } = tutorLanguageLabel(code);
                    return (
                      <SelectItem key={code} value={code}>
                        {flag} {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              No conversation matches this filter.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {visible.map((conversation) => {
                const { flag, label } = tutorLanguageLabel(conversation.target_language);
                const created = new Date(conversation.created_at);
                const turns = learnerTurns(conversation);
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => setOpen(String(conversation.id))}
                      className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-secondary/60 focus-visible:bg-secondary/60 focus-visible:outline-none sm:px-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl" aria-hidden="true">
                        {flag}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-foreground">
                          {conversation.topic || 'Conversation'}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {label}
                          {conversation.duration_minutes ? ` · ${conversation.duration_minutes} min` : ''}
                          {turns ? ` · ${turns} ${turns === 1 ? 'turn' : 'turns'}` : ''}
                        </span>
                      </span>
                      <time
                        dateTime={conversation.created_at}
                        title={format(created, 'd MMM yyyy, HH:mm')}
                        className="hidden shrink-0 text-xs text-muted-foreground sm:block"
                      >
                        {formatDistanceToNow(created, { addSuffix: true })}
                      </time>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <TranscriptSheet conversation={open} onClose={() => setOpen(null)} />
    </div>
  );
}
