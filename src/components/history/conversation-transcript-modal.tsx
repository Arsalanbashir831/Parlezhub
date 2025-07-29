'use client';

import React from 'react';
import { Bot, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface ConversationTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationTitle: string;
  conversationDate: string;
  conversationLanguage: string;
  conversationDuration: number;
  conversationScore: number;
}

// Mock transcript data - in a real app, this would come from an API
const getMockTranscript = (conversationId: string): TranscriptMessage[] => {
  const transcripts: Record<string, TranscriptMessage[]> = {
    '1': [
      {
        id: '1',
        content: "Hello! I'd like to practice ordering food at a restaurant.",
        sender: 'user',
        timestamp: '10:30:00',
      },
      {
        id: '2',
        content:
          "¡Hola! I'd be happy to help you practice restaurant conversation in Spanish. Let's imagine you're at a nice restaurant in Madrid. I'll be your waiter. ¡Bienvenido! How can I help you today?",
        sender: 'ai',
        timestamp: '10:30:05',
      },
      {
        id: '3',
        content: 'Hola, me gustaría ver el menú, por favor.',
        sender: 'user',
        timestamp: '10:30:15',
      },
      {
        id: '4',
        content:
          '¡Perfecto! Aquí tiene el menú. Today we have some excellent specials: paella valenciana, gazpacho andaluz, and cordero asado. What type of food are you in the mood for?',
        sender: 'ai',
        timestamp: '10:30:20',
      },
      {
        id: '5',
        content: 'La paella suena deliciosa. ¿Qué ingredientes tiene?',
        sender: 'user',
        timestamp: '10:30:35',
      },
      {
        id: '6',
        content:
          'Excellent pronunciation! Our paella valenciana has rice, chicken, rabbit, green beans, lima beans, tomatoes, and saffron. It serves two people. Would you like to order it?',
        sender: 'ai',
        timestamp: '10:30:40',
      },
      {
        id: '7',
        content: 'La paella suena deliciosa. ¿Qué ingredientes tiene?',
        sender: 'user',
        timestamp: '10:30:35',
      },
      {
        id: '8',
        content:
          'Excellent pronunciation! Our paella valenciana has rice, chicken, rabbit, green beans, lima beans, tomatoes, and saffron. It serves two people. Would you like to order it?',
        sender: 'ai',
        timestamp: '10:30:40',
      },
      {
        id: '9',
        content: 'La paella suena deliciosa. ¿Qué ingredientes tiene?',
        sender: 'user',
        timestamp: '10:30:35',
      },
      {
        id: '10',
        content:
          'Excellent pronunciation! Our paella valenciana has rice, chicken, rabbit, green beans, lima beans, tomatoes, and saffron. It serves two people. Would you like to order it?',
        sender: 'ai',
        timestamp: '10:30:40',
      },
    ],
    '2': [
      {
        id: '1',
        content:
          "I'm planning a trip to France and want to practice asking for directions.",
        sender: 'user',
        timestamp: '14:15:00',
      },
      {
        id: '2',
        content:
          "Bonjour! That's wonderful that you're visiting France. I'd love to help you practice asking for directions. Let's pretend you're lost in Paris and need to find the Louvre Museum. Go ahead and ask me for directions in French!",
        sender: 'ai',
        timestamp: '14:15:05',
      },
      {
        id: '3',
        content:
          'Bonjour, excusez-moi. Pouvez-vous me dire où se trouve le Louvre?',
        sender: 'user',
        timestamp: '14:15:20',
      },
      {
        id: '4',
        content:
          "Bonjour! Bien sûr, je peux vous aider. Le Louvre n'est pas très loin d'ici. You need to go straight for about 200 meters, then turn left at the traffic light. Continue walking for about 5 minutes and you'll see the glass pyramid. You can't miss it!",
        sender: 'ai',
        timestamp: '14:15:25',
      },
    ],
  };

  return transcripts[conversationId] || [];
};

const formatTime = (timeString: string) => {
  return new Date(`2024-01-01T${timeString}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ConversationTranscriptModal: React.FC<
  ConversationTranscriptModalProps
> = ({
  isOpen,
  onClose,
  conversationId,
  conversationTitle,
  conversationDate,
  conversationLanguage,
  conversationDuration,
  conversationScore,
}) => {
  const transcript = getMockTranscript(conversationId);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[85vh] max-w-4xl flex-col p-0">
        <DialogHeader className="flex-shrink-0 border-b border-gray-200 p-6 pb-4 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <DialogTitle className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Conversation Transcript
              </DialogTitle>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {conversationTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{conversationLanguage}</span>
                  <span>•</span>
                  <span>{new Date(conversationDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{conversationDuration} minutes</span>
                  <Badge className={getScoreColor(conversationScore)}>
                    {conversationScore}% Score
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6">
            <div className="space-y-4 py-6">
              {transcript.length > 0 ? (
                transcript.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary-100 text-xs text-primary-700">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          message.sender === 'user'
                            ? 'text-primary-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-gray-100 text-xs text-gray-600">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  <p>No transcript available for this conversation.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
