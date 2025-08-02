'use client';

import { useCallback, useState } from 'react';

import { Conversation } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import { Card, CardContent } from '@/components/ui/card';
import BookingDialog from '@/components/chat/booking-dialog';
import ChatHeader from '@/components/chat/chat-header';
import ConversationList from '@/components/chat/conversation-list';
import MessageInput from '@/components/chat/message-input';
import MessageList from '@/components/chat/message-list';

// Mock conversation data
const mockConversations = [
  {
    id: '1',
    name: 'Maria Rodriguez',
    avatar: '/placeholders/avatar.jpg',
    lastMessage: "Great! Let's schedule our next lesson for tomorrow at 3 PM.",
    timestamp: '2024-01-15T14:30:00Z',
    unreadCount: 2,
    isOnline: true,
    type: 'teacher',
    calendlyLink: 'https://calendly.com/maria-rodriguez/spanish-lesson',
  },
  {
    id: '2',
    name: 'Jean Dubois',
    avatar: '/placeholders/avatar.jpg',
    lastMessage:
      "I've prepared some exercises for French pronunciation. Check them out!",
    timestamp: '2024-01-15T10:15:00Z',
    unreadCount: 0,
    isOnline: false,
    type: 'teacher',
    calendlyLink: 'https://calendly.com/jean-dubois/french-lesson',
  },
  {
    id: '3',
    name: 'Support Team',
    avatar: '/placeholders/avatar.jpg',
    lastMessage: 'How can we help you today?',
    timestamp: '2024-01-14T16:45:00Z',
    unreadCount: 0,
    isOnline: true,
    type: 'support',
    calendlyLink: null,
  },
];

// Mock messages for each conversation
const mockMessagesByConversation: Record<
  string,
  Array<{
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    type: string;
  }>
> = {
  '1': [
    {
      id: '1',
      senderId: 'teacher-1',
      senderName: 'Maria Rodriguez',
      content: 'Hello! How are you doing with your Spanish practice?',
      timestamp: '2024-01-15T13:00:00Z',
      type: 'text',
    },
    {
      id: '2',
      senderId: 'student-1',
      senderName: 'You',
      content:
        "Hi Maria! I've been practicing every day. I feel more confident with conversations now.",
      timestamp: '2024-01-15T13:05:00Z',
      type: 'text',
    },
    {
      id: '3',
      senderId: 'teacher-1',
      senderName: 'Maria Rodriguez',
      content:
        "That's wonderful to hear! Your pronunciation has improved significantly.",
      timestamp: '2024-01-15T13:10:00Z',
      type: 'text',
    },
    {
      id: '4',
      senderId: 'student-1',
      senderName: 'You',
      content:
        "Thank you! I'd like to focus on business Spanish in our next session.",
      timestamp: '2024-01-15T13:15:00Z',
      type: 'text',
    },
    {
      id: '5',
      senderId: 'teacher-1',
      senderName: 'Maria Rodriguez',
      content: "Great! Let's schedule our next lesson for tomorrow at 3 PM.",
      timestamp: '2024-01-15T14:30:00Z',
      type: 'text',
    },
  ],
  '2': [
    {
      id: '6',
      senderId: 'teacher-2',
      senderName: 'Jean Dubois',
      content: 'Bonjour! How are your French studies going?',
      timestamp: '2024-01-15T09:00:00Z',
      type: 'text',
    },
    {
      id: '7',
      senderId: 'student-1',
      senderName: 'You',
      content: "Bonjour Jean! I'm making good progress with pronunciation.",
      timestamp: '2024-01-15T09:15:00Z',
      type: 'text',
    },
    {
      id: '8',
      senderId: 'teacher-2',
      senderName: 'Jean Dubois',
      content:
        "I've prepared some exercises for French pronunciation. Check them out!",
      timestamp: '2024-01-15T10:15:00Z',
      type: 'text',
    },
  ],
  '3': [
    {
      id: '9',
      senderId: 'support-1',
      senderName: 'Support Team',
      content: 'Hello! How can we help you today?',
      timestamp: '2024-01-14T16:45:00Z',
      type: 'text',
    },
    {
      id: '10',
      senderId: 'student-1',
      senderName: 'You',
      content: 'Hi! I have a question about my subscription.',
      timestamp: '2024-01-14T16:50:00Z',
      type: 'text',
    },
  ],
};

export default function ChatPage() {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // Initialize chat hook with mock data
  const {
    selectedConversation,
    currentMessages,
    newMessage,
    searchQuery,
    isLoading,
    selectConversation,
    sendMessage,
    setNewMessage,
    setSearchQuery,
    filteredConversations,
  } = useChat({
    currentUserId: 'student-1',
    initialConversations: mockConversations,
    initialMessages: mockMessagesByConversation,
    simulateResponses: true,
    responseDelay: 1500,
  });

  const handleBookCall = useCallback(() => {
    if (selectedConversation?.calendlyLink) {
      window.open(selectedConversation.calendlyLink, '_blank');
    } else {
      setIsBookingDialogOpen(true);
    }
  }, [selectedConversation?.calendlyLink]);

  const handleBookingDialogClose = useCallback(() => {
    setIsBookingDialogOpen(false);
  }, []);

  const handleConversationSelect = useCallback(
    (conversation: Conversation) => {
      selectConversation(conversation);
      setShowChatOnMobile(true);
    },
    [selectConversation]
  );

  const handleBackToList = useCallback(() => {
    setShowChatOnMobile(false);
  }, []);

  return (
    <>
      <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
        <Card className="h-full">
          <CardContent className="h-full p-0">
            <div className="flex h-full">
              {/* Conversations List - Desktop: always show, Mobile: show only when not in chat */}
              <div
                className={`${showChatOnMobile ? 'hidden md:flex' : 'flex'} ${selectedConversation ? 'md:flex' : 'flex'}`}
              >
                <ConversationList
                  conversations={filteredConversations}
                  selectedConversationId={selectedConversation?.id || ''}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onConversationSelect={handleConversationSelect}
                />
              </div>

              {/* Chat Area - Desktop: show when selected, Mobile: show only when showChatOnMobile is true */}
              {selectedConversation && (
                <div
                  className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}
                >
                  {/* Chat Header */}
                  <ChatHeader
                    conversation={selectedConversation}
                    onBookCall={handleBookCall}
                    onBack={handleBackToList}
                    showBackButton={true}
                  />

                  {/* Messages */}
                  <MessageList
                    messages={currentMessages}
                    currentUserId="student-1"
                  />

                  {/* Message Input */}
                  <MessageInput
                    value={newMessage}
                    onChange={setNewMessage}
                    onSend={sendMessage}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* No conversation selected state - Desktop only */}
              {!selectedConversation && (
                <div className="hidden flex-1 items-center justify-center md:flex">
                  <div className="text-center text-gray-500">
                    <h3 className="mb-2 text-lg font-medium">
                      No conversation selected
                    </h3>
                    <p>Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        isOpen={isBookingDialogOpen}
        onClose={handleBookingDialogClose}
      />
    </>
  );
}
