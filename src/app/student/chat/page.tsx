'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { MessageSquare } from 'lucide-react';

import { ChatRoom } from '@/types/chat';
import { useRealChat } from '@/hooks/useRealChat';
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
    currentUserRole: 'student',
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
      // Update URL with chatId param
      const params = new URLSearchParams(searchParams.toString());
      params.set('chatId', chat.id);
      router.push(`${pathname}?${params.toString()}`);
      setShowChatOnMobile(true);
    },
    [selectChat, router, pathname, searchParams]
  );

  const handleBackToList = useCallback(() => {
    setShowChatOnMobile(false);
    // Remove chatId from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('chatId');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  // Auto-select chat from URL param if present
  useEffect(() => {
    const idFromUrl = searchParams.get('chatId');
    if (idFromUrl) {
      // Attempt selection via hook helper
      selectChatById(idFromUrl);
      setShowChatOnMobile(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
        <div className="flex h-full items-center justify-center rounded-3xl bg-background shadow-2xl">
          <div className="space-y-4 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            <h3 className="font-serif text-xl font-bold text-primary-500">
              Aligning the Stars...
            </h3>
            <p className="text-sm uppercase tracking-widest text-primary-100/60">
              Fetching your chat history
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
        <div className="h-full overflow-hidden rounded-3xl border border-primary-500/10 bg-background shadow-2xl">
          <div className="flex h-full w-full">
            {/* Conversations List - Desktop: always show, Mobile: show only when not in chat */}
            <div
              className={`w-full md:w-auto ${showChatOnMobile ? 'hidden md:flex' : 'flex'} ${selectedChat ? 'md:flex' : 'flex'}`}
            >
              <RealConversationList
                chats={filteredChats}
                selectedChatId={selectedChat?.id || ''}
                searchQuery={searchQuery}
                currentUserRole="student"
                onSearchChange={setSearchQuery}
                onChatSelect={handleChatSelect}
              />
            </div>

            {/* Chat Area - Desktop: show when selected, Mobile: show only when showChatOnMobile is true */}
            {selectedChat && (
              <div
                className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white/[0.02]`}
              >
                {/* Chat Header */}
                <RealChatHeader
                  chat={selectedChat}
                  currentUserRole="student"
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
              <div className="hidden flex-1 items-center justify-center bg-white/[0.02] md:flex">
                <div className="text-center">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 shadow-lg shadow-primary-500/5">
                    <MessageSquare className="h-10 w-10 text-primary-500" />
                  </div>
                  <h3 className="mb-2 font-serif text-2xl font-bold text-primary-500">
                    No conversation selected
                  </h3>
                  <p className="text-sm tracking-wide text-primary-100/60">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
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
