'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

import { ChatRoom } from '@/types/chat';
import { useUser } from '@/contexts/user-context';
import { useRealChat } from '@/hooks/useRealChat';
import { resolveChatPeer } from '@/lib/chat-peer';
import BookingDialog from '@/components/chat/booking-dialog';
import MessageInput from '@/components/chat/message-input';
import RealChatHeader from '@/components/chat/real-chat-header';
import RealConversationList from '@/components/chat/real-conversation-list';
import RealMessageList from '@/components/chat/real-message-list';

interface ConsultationChatViewProps {
  role: 'student' | 'consultant';
}

export default function ConsultationChatView({
  role,
}: ConsultationChatViewProps) {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    selectedChat,
    currentMessages,
    newMessage,
    searchQuery,
    isLoading,
    isTyping,
    peerOnline,
    selectChat,
    sendMessage,
    setNewMessage,
    setSearchQuery,
    selectChatById,
    filteredChats,
    draftFiles,
    addDraftFiles,
    removeDraftFile,
    isSending,
    messagesError,
    loadMessages,
    notifyTyping,
  } = useRealChat({
    currentUserId: user?.id || '',
    currentUserRole: role,
  });

  const handleBookCall = useCallback(() => {
    setIsBookingDialogOpen(true);
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
    // Mobile-only view toggle; the selection stays intact for desktop.
    setShowChatOnMobile(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('chatId');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  // Restore an open conversation from the URL (deep link / refresh)
  useEffect(() => {
    const idFromUrl = searchParams.get('chatId');
    if (idFromUrl) {
      selectChatById(idFromUrl);
      setShowChatOnMobile(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (!user) {
    return (
      <div
        className="obs-chat-shell flex items-center justify-center"
        role="status"
      >
        <div className="space-y-3 text-center">
          <p className="obs-label">Aligning the stars…</p>
          <p className="text-sm text-muted-foreground">
            Fetching your conversations
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="obs-chat-shell grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
        {/* Conversation rail — always visible on desktop, hidden once a
            chat is open on mobile */}
        <div
          className={`min-h-0 min-w-0 ${
            showChatOnMobile ? 'hidden md:block' : 'block'
          }`}
        >
          <RealConversationList
            chats={filteredChats}
            selectedChatId={selectedChat?.id || ''}
            searchQuery={searchQuery}
            currentUserRole={role}
            currentUserId={user.id}
            isLoading={isLoading && filteredChats.length === 0}
            onSearchChange={setSearchQuery}
            onChatSelect={handleChatSelect}
          />
        </div>

        {/* Thread */}
        {selectedChat ? (
          <div
            className={`min-h-0 min-w-0 flex-col ${
              showChatOnMobile ? 'flex' : 'hidden md:flex'
            }`}
          >
            <RealChatHeader
              chat={selectedChat}
              currentUserRole={role}
              currentUserId={user.id}
              peerOnline={peerOnline}
              isTyping={isTyping}
              onBookCall={handleBookCall}
              onBack={handleBackToList}
              showBackButton={true}
            />
            <RealMessageList
              messages={currentMessages}
              currentUserId={user.id}
              peerAvatar={
                resolveChatPeer(selectedChat, role, user.id).avatar || undefined
              }
              ownAvatar={user.profile_picture || undefined}
              isLoading={isLoading && currentMessages.length === 0}
              isTyping={isTyping}
              error={messagesError}
              onRetry={() => loadMessages(selectedChat.id)}
            />
            {/* Sending goes over HTTP, so a dropped socket only costs live
                delivery — it must never lock the composer. */}
            <MessageInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={() => sendMessage()}
              onTyping={notifyTyping}
              disabled={isSending}
              draftFiles={draftFiles}
              onAddFiles={addDraftFiles}
              onRemoveFile={removeDraftFile}
              isSending={isSending}
            />
          </div>
        ) : (
          <div className="hidden min-h-0 min-w-0 items-center justify-center md:flex">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--solar-orange)_25%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_10%,transparent)]">
                <MessageSquare
                  className="h-6 w-6 text-[var(--solar-orange)]"
                  aria-hidden="true"
                />
              </div>
              <h2 className="font-serif text-xl text-foreground">
                No conversation selected
              </h2>
              <p className="text-sm text-muted-foreground">
                Pick a conversation to continue where you left off.
              </p>
            </div>
          </div>
        )}
      </div>

      <BookingDialog
        teacherId={selectedChat?.teacher_id}
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
      />
    </>
  );
}
