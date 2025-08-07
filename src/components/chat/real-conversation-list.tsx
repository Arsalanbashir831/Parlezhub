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
  currentUserRole: 'student' | 'teacher';
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
          currentUserRole === 'student' ? chat.teacher_name : chat.student_name;
        return searchName?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }, [chats, searchQuery, currentUserRole]);

    return (
      <div className="w-full min-w-0 overflow-hidden border-r bg-gray-50 md:w-80 md:min-w-80 md:max-w-80">
        <div className="border-b bg-white p-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-5rem)]">
          <div className="space-y-1 p-2">
            {filteredChats.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-center text-gray-500">
                <div>
                  <p className="text-sm">No conversations found</p>
                  <p className="text-xs">
                    {currentUserRole === 'student'
                      ? 'Start a conversation with a teacher from their service details'
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
