'use client';

import React from 'react';
import { Bot, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  correction?: string;
  feedback?: string;
}

interface ConversationTranscriptProps {
  messages: ConversationMessage[];
  tutorName: string;
}

export const ConversationTranscript = React.memo<ConversationTranscriptProps>(
  ({ messages, tutorName }) => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Conversation Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'ai' && (
                  <Avatar className="mt-1 h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-primary-100 text-sm text-primary-700">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs lg:max-w-md ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        message.type === 'user'
                          ? 'text-primary-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Corrections and feedback for user messages */}
                  {message.type === 'user' &&
                    (message.correction || message.feedback) && (
                      <div className="mt-2 space-y-2">
                        {message.correction && (
                          <div className="rounded border border-yellow-200 bg-yellow-50 p-2 text-xs">
                            <span className="font-medium text-yellow-800">
                              Suggested:{' '}
                            </span>
                            <span className="text-yellow-700">
                              {message.correction}
                            </span>
                          </div>
                        )}
                        {message.feedback && (
                          <div className="rounded border border-blue-200 bg-blue-50 p-2 text-xs">
                            <span className="font-medium text-blue-800">
                              Tip:{' '}
                            </span>
                            <span className="text-blue-700">
                              {message.feedback}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                </div>
                {message.type === 'user' && (
                  <Avatar className="mt-1 h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-sm text-gray-700">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
);

ConversationTranscript.displayName = 'ConversationTranscript';
