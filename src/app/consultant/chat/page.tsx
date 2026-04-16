'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';
import { useUser } from '@/contexts/user-context';

import { ChatRoom } from '@/types/chat';
import { useRealChat } from '@/hooks/useRealChat';
import { Card, CardContent } from '@/components/ui/card';
import BookingDialog from '@/components/chat/booking-dialog';
import MessageInput from '@/components/chat/message-input';
import RealChatHeader from '@/components/chat/real-chat-header';
import RealConversationList from '@/components/chat/real-conversation-list';
import RealMessageList from '@/components/chat/real-message-list';

export default function ChatPage() {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize real chat hook
  const {
    chats,
    selectedChat,
    currentMessages,
    newMessage,
    searchQuery,
    isLoading,
    isConnected,
    isTyping,
    selectChat,
    sendMessage,
    setNewMessage,
    setSearchQuery,
    selectChatById,
    filteredChats,
  } = useRealChat({
    currentUserId: user?.id || '',
    currentUserRole: 'consultant',
  });

  const handleBookCall = useCallback(() => {
    // For now, show the booking dialog
    // In the future, you can integrate with Calendly or other booking systems
    setIsBookingDialogOpen(true);
  }, []);

  const handleBookingDialogClose = useCallback(() => {
    setIsBookingDialogOpen(false);
  }, []);

  const handleChatSelect = useCallback(
    (chat: ChatRoom) => {
      selectChat(chat);
      const params = new URLSearchParams(searchParams.toString());
      params.set('chatId', chat.id);
      router.push(`${pathname}?${params.toString()}`);
      setShowChatOnMobile(true);
    },
    [selectChat, router, pathname, searchParams]
  );

  const handleBackToList = useCallback(() => {
    setShowChatOnMobile(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('chatId');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const idFromUrl = searchParams.get('chatId');
    if (idFromUrl) {
      selectChatById(idFromUrl);
      setShowChatOnMobile(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
        <Card className="h-full overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
          <CardContent className="h-full p-0">
            <div className="flex h-full flex-col items-center justify-center gap-6">
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary-500"></div>
              <div className="text-center">
                <h3 className="mb-2 font-serif text-3xl font-bold text-white">Loading...</h3>
                <p className="text-primary-100/60 font-medium">Please wait while we load your chat data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
        <Card className="h-full overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
          <CardContent className="h-full p-0">
            <div className="flex h-full w-full">
              {/* Conversations List - Desktop: always show, Mobile: show only when not in chat */}
              <div
                className={`w-full md:w-auto ${showChatOnMobile ? 'hidden md:flex' : 'flex'} ${selectedChat ? 'md:flex' : 'flex'}`}
              >
                <RealConversationList
                  chats={filteredChats}
                  selectedChatId={selectedChat?.id || ''}
                  searchQuery={searchQuery}
                  currentUserRole="consultant"
                  onSearchChange={setSearchQuery}
                  onChatSelect={handleChatSelect}
                />
              </div>

              {/* Chat Area - Desktop: show when selected, Mobile: show only when showChatOnMobile is true */}
              {selectedChat && (
                <div
                  className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}
                >
                  {/* Chat Header */}
                  <RealChatHeader
                    chat={selectedChat}
                    currentUserRole="consultant"
                    isConnected={isConnected}
                    isTyping={isTyping}
                    onBookCall={handleBookCall}
                    onBack={handleBackToList}
                    showBackButton={true}
                  />

                  {/* Messages */}
                  <RealMessageList
                    messages={currentMessages}
                    currentUserId={user.id}
                  />

                  {/* Message Input */}
                  <MessageInput
                    value={newMessage}
                    onChange={setNewMessage}
                    onSend={sendMessage}
                    disabled={isLoading || !isConnected}
                  />
                </div>
              )}

              {/* No conversation selected state - Desktop only */}
              {!selectedChat && (
                <div className="hidden flex-1 flex-col items-center justify-center gap-6 md:flex">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary-500/10 bg-primary-500/5 text-primary-500/20">
                    <Users className="h-10 w-10 text-primary-500/40" />
                  </div>
                  <div className="text-center">
                    <h3 className="mb-2 font-serif text-2xl font-bold text-white">
                      No conversation selected
                    </h3>
                    <p className="text-primary-100/60 font-medium">Select a conversation to start chatting with your students</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        teacherId={selectedChat?.consultant_id}
        isOpen={isBookingDialogOpen}
        onClose={handleBookingDialogClose}
      />
    </>
  );
}
