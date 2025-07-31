'use client';

import { memo } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  type: string;
  calendlyLink: string | null;
}

interface ChatHeaderProps {
  conversation: Conversation;
  onBookCall: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ChatHeader = memo(
  ({
    conversation,
    onBookCall,
    onBack,
    showBackButton = false,
  }: ChatHeaderProps) => {
    return (
      <>
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="ml-4 mt-2 items-center self-start p-2 md:hidden"
          >
            <ArrowLeft className="h-2 w-4" />
            <span className="text-sm">Back</span>
          </Button>
        )}
        <div className="flex items-center justify-between border-b bg-white p-4 pt-0">
          <div className="flex w-full items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.avatar || '/placeholder.svg'} />
              <AvatarFallback className="bg-primary-100 text-primary-700">
                {conversation.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{conversation.name}</h3>
              <p className="text-sm text-gray-500">
                {conversation.isOnline ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {conversation.type === 'teacher' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBookCall}
                className="bg-primary-500 text-white hover:bg-primary-600"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book a Call
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }
);

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
