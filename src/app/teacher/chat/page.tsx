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

// Mock conversation data - Teacher's perspective (chatting with students)
const mockConversations = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: "Thank you for the feedback! I'll practice more this week.",
    timestamp: '2024-01-15T14:30:00Z',
    unreadCount: 2,
    isOnline: true,
    type: 'student',
    calendlyLink: null,
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'Could you please send me the homework materials?',
    timestamp: '2024-01-15T10:15:00Z',
    unreadCount: 1,
    isOnline: false,
    type: 'student',
    calendlyLink: null,
  },
  {
    id: '3',
    name: 'Michael Brown',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: "I'm ready for our next lesson. See you tomorrow!",
    timestamp: '2024-01-14T16:45:00Z',
    unreadCount: 0,
    isOnline: true,
    type: 'student',
    calendlyLink: null,
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'The pronunciation exercises are really helpful!',
    timestamp: '2024-01-14T12:20:00Z',
    unreadCount: 0,
    isOnline: false,
    type: 'student',
    calendlyLink: null,
  },
  {
    id: '5',
    name: 'Support Team',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'How can we help you today?',
    timestamp: '2024-01-13T09:15:00Z',
    unreadCount: 0,
    isOnline: true,
    type: 'support',
    calendlyLink: null,
  },
];

// Mock messages for each conversation - Teacher's perspective
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
      senderName: 'You',
      content: 'Hello Alex! How did the pronunciation exercises go this week?',
      timestamp: '2024-01-15T13:00:00Z',
      type: 'text',
    },
    {
      id: '2',
      senderId: 'student-1',
      senderName: 'Alex Johnson',
      content:
        "Hi! I've been practicing every day. I feel more confident with conversations now.",
      timestamp: '2024-01-15T13:05:00Z',
      type: 'text',
    },
    {
      id: '3',
      senderId: 'teacher-1',
      senderName: 'You',
      content:
        "That's wonderful to hear! Your progress has been really impressive.",
      timestamp: '2024-01-15T13:10:00Z',
      type: 'text',
    },
    {
      id: '4',
      senderId: 'student-1',
      senderName: 'Alex Johnson',
      content:
        "Thank you! I'd like to focus on business conversations in our next session.",
      timestamp: '2024-01-15T13:15:00Z',
      type: 'text',
    },
    {
      id: '5',
      senderId: 'teacher-1',
      senderName: 'You',
      content:
        "Perfect! I'll prepare some business scenarios for our next lesson.",
      timestamp: '2024-01-15T14:00:00Z',
      type: 'text',
    },
    {
      id: '6',
      senderId: 'student-1',
      senderName: 'Alex Johnson',
      content: "Thank you for the feedback! I'll practice more this week.",
      timestamp: '2024-01-15T14:30:00Z',
      type: 'text',
    },
  ],
  '2': [
    {
      id: '7',
      senderId: 'teacher-1',
      senderName: 'You',
      content: "Hi Sarah! I've prepared some new vocabulary exercises for you.",
      timestamp: '2024-01-15T09:00:00Z',
      type: 'text',
    },
    {
      id: '8',
      senderId: 'student-2',
      senderName: 'Sarah Chen',
      content: "Thank you! I'm excited to work on them.",
      timestamp: '2024-01-15T09:15:00Z',
      type: 'text',
    },
    {
      id: '9',
      senderId: 'student-2',
      senderName: 'Sarah Chen',
      content: 'Could you please send me the homework materials?',
      timestamp: '2024-01-15T10:15:00Z',
      type: 'text',
    },
  ],
  '3': [
    {
      id: '10',
      senderId: 'student-3',
      senderName: 'Michael Brown',
      content: "Good morning! Are we still on for tomorrow's lesson?",
      timestamp: '2024-01-14T16:30:00Z',
      type: 'text',
    },
    {
      id: '11',
      senderId: 'teacher-1',
      senderName: 'You',
      content: 'Yes, absolutely! See you at 3 PM tomorrow.',
      timestamp: '2024-01-14T16:35:00Z',
      type: 'text',
    },
    {
      id: '12',
      senderId: 'student-3',
      senderName: 'Michael Brown',
      content: "I'm ready for our next lesson. See you tomorrow!",
      timestamp: '2024-01-14T16:45:00Z',
      type: 'text',
    },
  ],
  '4': [
    {
      id: '13',
      senderId: 'teacher-1',
      senderName: 'You',
      content: 'Hi Emma! How are you finding the new pronunciation drills?',
      timestamp: '2024-01-14T12:00:00Z',
      type: 'text',
    },
    {
      id: '14',
      senderId: 'student-4',
      senderName: 'Emma Wilson',
      content: 'The pronunciation exercises are really helpful!',
      timestamp: '2024-01-14T12:20:00Z',
      type: 'text',
    },
  ],
  '5': [
    {
      id: '15',
      senderId: 'support-1',
      senderName: 'Support Team',
      content: 'Hello! How can we help you today?',
      timestamp: '2024-01-13T09:15:00Z',
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
    currentUserId: 'teacher-1',
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
                  {/* Chat Header with Back Button */}
                  <ChatHeader
                    conversation={selectedConversation}
                    onBookCall={handleBookCall}
                    onBack={handleBackToList}
                    showBackButton={true}
                  />

                  {/* Messages */}
                  <MessageList
                    messages={currentMessages}
                    currentUserId="teacher-1"
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
