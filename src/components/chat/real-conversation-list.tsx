'use client';

import { memo, useMemo } from 'react';
import { Search } from 'lucide-react';

import { ChatRoom } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { resolveChatPeer } from '@/lib/chat-peer';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  LoadingLayout,
  Skeleton,
} from '@/components/astrology/ui/observatory-state';

import RealConversationItem from './real-conversation-item';

interface RealConversationListProps {
  chats: ChatRoom[];
  selectedChatId: string;
  searchQuery: string;
  currentUserRole: 'student' | 'consultant';
  currentUserId?: string;
  isLoading?: boolean;
  onSearchChange: (query: string) => void;
  onChatSelect: (chat: ChatRoom) => void;
}

const RealConversationList = memo(
  ({
    chats,
    selectedChatId,
    searchQuery,
    currentUserRole,
    currentUserId,
    isLoading = false,
    onSearchChange,
    onChatSelect,
  }: RealConversationListProps) => {
    const filteredChats = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return chats;
      return chats.filter((chat) =>
        resolveChatPeer(chat, currentUserRole, currentUserId)
          .name.toLowerCase()
          .includes(query)
      );
    }, [chats, searchQuery, currentUserRole, currentUserId]);

    return (
      <div className="flex h-full w-full min-w-0 flex-col border-r border-border bg-card">
        <div className="shrink-0 space-y-3 border-b border-border p-4">
          <p className="obs-label">Conversations</p>
          <div className="group relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-[var(--solar-orange)]" />
            <Input
              aria-label="Search conversations"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 rounded-xl border-border bg-[var(--surface-2)] pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-[color-mix(in_srgb,var(--solar-orange)_30%,transparent)]"
            />
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-1 p-2">
            {isLoading ? (
              <LoadingLayout label="Loading conversations…" className="gap-1">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    aria-hidden="true"
                    className="flex items-center gap-3 rounded-xl border border-transparent p-3"
                  >
                    <Skeleton className="h-10 w-10 shrink-0" rounded="rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-32 max-w-full" rounded="rounded-md" />
                      <Skeleton className="h-3 w-40 max-w-full" rounded="rounded-md" />
                    </div>
                  </div>
                ))}
              </LoadingLayout>
            ) : filteredChats.length === 0 ? (
              <div className="flex h-48 items-center justify-center p-6 text-center">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground">
                    No conversations found
                  </p>
                  <p className="obs-label">
                    {currentUserRole === 'student'
                      ? 'Start one from an astrologer profile'
                      : 'Students will start conversations with you'}
                  </p>
                </div>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <RealConversationItem
                  key={chat.id}
                  chat={chat}
                  currentUserRole={currentUserRole}
                  currentUserId={currentUserId}
                  isSelected={selectedChatId === chat.id}
                  onSelect={onChatSelect}
                />
              ))
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    );
  }
);

RealConversationList.displayName = 'RealConversationList';

export default RealConversationList;
