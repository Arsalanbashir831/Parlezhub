'use client';

import { memo } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';

import { ChatRoom } from '@/types/chat';
import { cn } from '@/lib/utils';
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
          <div className="flex items-center justify-between border-b border-primary-500/10 bg-background/50 px-4 py-3 backdrop-blur-md md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="items-center text-primary-400 hover:bg-primary-500/10 hover:text-primary-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Back
              </span>
            </Button>

            <div className="flex items-center gap-2">
              {currentUserRole === 'student' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBookCall}
                  className="h-9 rounded-xl border-none bg-primary-500 px-4 font-bold text-primary-950 shadow-lg shadow-primary-500/20 hover:bg-primary-600"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Call
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col justify-between border-b border-primary-500/10 bg-background/80 px-6 py-4 backdrop-blur-xl md:flex-row md:items-center">
          <div className="flex w-full items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-primary-500/20 p-0.5">
                <AvatarImage
                  src={otherParticipantAvatar || '/placeholders/avatar.jpg'}
                  className="rounded-full"
                />
                <AvatarFallback className="bg-primary-500/10 font-bold text-primary-400">
                  {otherParticipantName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background shadow-sm',
                  isConnected ? 'bg-green-500' : 'bg-gray-500'
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="truncate text-lg font-bold text-white">
                  {otherParticipantName}
                </h3>
                <Badge
                  variant="outline"
                  className="hidden border-primary-500/30 bg-primary-500/5 text-[10px] font-bold uppercase tracking-widest text-primary-400 sm:inline-flex"
                >
                  {currentUserRole === 'student' ? 'Teacher' : 'Student'}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <p
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-widest transition-colors',
                    isTyping
                      ? 'animate-pulse text-primary-400'
                      : isConnected
                        ? 'text-green-500/80'
                        : 'text-primary-100/30'
                  )}
                >
                  {isTyping ? 'Writing...' : isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-4 self-center md:flex">
            {currentUserRole === 'student' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBookCall}
                className="h-10 rounded-xl border-none bg-primary-500 px-6 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Consultation
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
