'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

import { astrologyChatHref } from '@/lib/astrology-navigation';
import { filteredChatGroups } from './chat-contexts';
import { cn } from '@/lib/utils';

interface ConversationRailProps {
  activeId: string;
  search: string;
  onNavigate?: () => void;
  className?: string;
}

/** Switching conversation drops any question carried over from another screen. */
function conversationHref(search: string, id: string) {
  const [path, query] = astrologyChatHref(search, id).split('?');
  const params = new URLSearchParams(query);
  params.delete('question');
  return `${path}?${params}`;
}

/** Topic threads, listed the way a chat app lists conversations. */
export default function ConversationRail({ activeId, search, onNavigate, className }: ConversationRailProps) {
  const [query, setQuery] = useState('');
  const groups = filteredChatGroups(query);
  const total = groups.reduce((count, group) => count + group.conversations.length, 0);

  return (
    <div className={cn('flex h-full min-h-0 w-full flex-col', className)}>
      <div className="shrink-0 space-y-3 border-b border-border px-4 py-4">
        <div>
          <h2 className="obs-label">Conversations</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Every topic keeps its own thread with your chart data.
          </p>
        </div>
        <label className="relative flex items-center">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Search conversations</span>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search conversations…"
            className="h-10 w-full rounded-xl border border-border bg-[var(--surface-2)] pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          />
        </label>
      </div>

      <nav aria-label="Conversations" className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-3">
        {total === 0 && (
          <p className="px-3 py-6 text-sm leading-relaxed text-muted-foreground">
            No conversation matches “{query}”.
          </p>
        )}
        {groups.map(group => (
          <section key={group.id} className="mb-1">
            <h3 className="obs-label px-3 pb-1 pt-4">{group.title}</h3>
            <ul className="space-y-0.5">
              {group.conversations.map(conversation => {
                const isActive = conversation.id === activeId;
                return (
                  <li key={conversation.id}>
                    <Link
                      href={conversationHref(search, conversation.id)}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex min-h-11 flex-col gap-0.5 rounded-xl px-3 py-2 transition-colors',
                        isActive
                          ? 'bg-[color-mix(in_srgb,var(--solar-orange)_12%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--solar-orange)_32%,transparent)]'
                          : 'hover:bg-secondary',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {isActive && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--solar-orange)]" />}
                        <span className={cn('truncate text-sm', isActive ? 'font-medium text-foreground' : 'text-foreground/90')}>
                          {conversation.title}
                        </span>
                      </span>
                      <span className="truncate pl-3.5 text-[11px] leading-relaxed text-muted-foreground">
                        {conversation.description}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>
    </div>
  );
}
