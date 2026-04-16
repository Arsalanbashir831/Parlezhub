'use client';

import { memo, useMemo } from 'react';
import { Search } from 'lucide-react';

import { ChatRoom } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import RealConversationItem from './real-conversation-item';

interface RealConversationListProps {
  chats: ChatRoom[];
  selectedChatId: string;
  searchQuery: string;
  currentUserRole: 'student' | 'consultant';
  onSearchChange: (query: string) => void;
  onChatSelect: (chat: ChatRoom) => void;
}

const RealConversationList = memo(
  ({
    chats,
    selectedChatId,
    searchQuery,
    currentUserRole,
    onSearchChange,
    onChatSelect,
  }: RealConversationListProps) => {
    const filteredChats = useMemo(() => {
      return chats.filter((chat) => {
        const searchName =
          currentUserRole === 'student' ? chat.consultant_name : chat.student_name;
        return searchName?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }, [chats, searchQuery, currentUserRole]);

    return (
      <div className="w-full min-w-0 overflow-hidden border-r border-primary-500/10 bg-background md:w-80 md:min-w-80 md:max-w-80">
        <div className="border-b border-primary-500/10 bg-background/50 p-6 backdrop-blur-md">
          <div className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary-500">
              Messages
            </h2>
          </div>
          <div className="group relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-primary-500/50 transition-colors group-focus-within:text-primary-500" />
            <Input
              placeholder="Seek a consultant..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border-primary-500/10 bg-white/[0.03] pl-10 text-primary-100 placeholder:text-primary-100/30 focus-visible:ring-primary-500/30"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-5rem)]">
          <div className="space-y-1 p-2">
            {filteredChats.length === 0 ? (
              <div className="flex h-48 items-center justify-center p-6 text-center">
                <div>
                  <p className="text-sm font-bold text-primary-300">
                    No conversations found
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-primary-100/40">
                    {currentUserRole === 'student'
                      ? 'Start a conversation with a consultant from their service details'
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
                  isSelected={selectedChatId === chat.id}
                  onSelect={onChatSelect}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
);

RealConversationList.displayName = 'RealConversationList';

export default RealConversationList;
