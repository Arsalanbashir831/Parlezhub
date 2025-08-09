'use client';

import { memo } from 'react';
import { ArrowLeft, Calendar, Wifi, WifiOff } from 'lucide-react';

import { ChatRoom } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RealChatHeaderProps {
  chat: ChatRoom;
  currentUserRole: 'student' | 'teacher';
  isConnected: boolean;
  isTyping: boolean;
  onBookCall?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const RealChatHeader = memo(
  ({
    chat,
    currentUserRole,
    isConnected,
    isTyping,
    onBookCall,
    onBack,
    showBackButton = false,
  }: RealChatHeaderProps) => {
    // Determine the other participant's name and avatar
    const otherParticipantName =
      currentUserRole === 'student' ? chat.teacher_name : chat.student_name;

    const otherParticipantAvatar =
      currentUserRole === 'student' ? chat.teacher_avatar : chat.student_avatar;

    return (
      <>
        {showBackButton && (
          <div className="flex items-center justify-between px-4 py-2 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="items-center self-start p-2 md:hidden"
            >
              <ArrowLeft className="h-2 w-4" />
              <span className="text-sm">Back</span>
            </Button>

            <div className="flex items-center gap-2">
              {currentUserRole === 'student' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBookCall}
                  className="h-fit bg-primary-500 px-2 py-2 text-xs text-white hover:bg-primary-600"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book a Call
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col justify-between border-b bg-white px-4 pb-2 pt-0 md:flex-row md:items-center md:pb-4 md:pt-4">
          <div className="flex w-full items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={otherParticipantAvatar || '/placeholders/avatar.jpg'}
              />
              <AvatarFallback className="bg-primary-100 text-primary-700">
                {otherParticipantName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 md:justify-start">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{otherParticipantName}</h3>
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>

                <Badge variant="outline" className="text-xs">
                  {currentUserRole === 'student' ? 'Teacher' : 'S tudent'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {isTyping ? 'Typing...' : isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 self-end md:flex">
            {currentUserRole === 'student' && (
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

RealChatHeader.displayName = 'RealChatHeader';

export default RealChatHeader;
