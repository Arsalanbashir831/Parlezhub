'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useAstrologyAIChat } from '@/hooks/useAstrologyAIChat';

interface AstrologyAIChatProps {
  category: string;
  studentId?: string;
  guestProfileId?: string;
}

export const AstrologyAIChat: React.FC<AstrologyAIChatProps> = ({
  category,
  studentId,
  guestProfileId,
}) => {
  const { messages, isSending, isLoadingHistory, error, sendMessage } =
    useAstrologyAIChat(category, studentId, guestProfileId);

  const [inputValue, setInputValue] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending]);

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-20 pt-12">
      <div className="bg-white/1 overflow-hidden rounded-[32px] border border-primary-500/20 shadow-2xl backdrop-blur-md">
        {/* Chat Header */}
        <div className="flex items-center border-b border-primary-500/10 bg-primary-500/10 px-6 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-primary-950 shadow-lg shadow-primary-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-primary-300">
                Cosmic Dialogue
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500/70">
                {isLoadingHistory
                  ? 'Connecting to Akashic Records...'
                  : 'Explore deeper meanings'}
              </p>
            </div>
          </div>
        </div>

        {/* Message Container */}
        <div className="flex min-h-[400px] flex-col p-4 md:p-8">
          {isLoadingHistory ? (
            <div className="flex flex-1 flex-col items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-primary-500/40" />
              <p className="mt-4 font-serif text-sm italic text-primary-100/40">
                Restoring your cosmic conversation...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
              <Sparkles className="mb-6 h-16 w-16 text-primary-500 drop-shadow-sm" />
              <p className="max-w-xs font-serif text-lg italic text-primary-100/60">
                &ldquo;What deeper questions do you have for the stars?&rdquo;
              </p>
            </div>
          ) : (
            <div className="mb-8 space-y-8">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex w-full gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${msg.role === 'user' ? 'border border-primary-500/20 bg-primary-500/10 text-primary-300' : 'bg-primary-500 text-primary-950 shadow-lg shadow-primary-500/20'}`}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div
                    className={`flex max-w-[85%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : ''}`}
                  >
                    <div
                      className={`rounded-3xl px-6 py-4 shadow-sm ${msg.role === 'user' ? 'rounded-tr-none border border-primary-500/20 bg-primary-500/10 text-primary-100' : 'bg-white/1 rounded-tl-none border border-primary-500/10 text-primary-300'}`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="ai-chat-markdown text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm font-medium leading-relaxed">
                          {msg.content}
                        </p>
                      )}
                    </div>
                    <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-primary-500/50">
                      {msg.role === 'user' ? 'You' : 'Astrologer'}
                    </span>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-500 text-primary-950 shadow-lg shadow-primary-500/20">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-3 rounded-3xl rounded-tl-none border border-primary-500/10 bg-white/5 px-6 py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                    <span className="text-sm italic text-primary-100/60">
                      Reading the signs...
                    </span>
                  </div>
                </div>
              )}
              {error && (
                <div className="mx-auto rounded-xl border border-red-100 bg-red-50 px-6 py-3 text-center">
                  <p className="text-sm font-bold text-red-500">{error}</p>
                </div>
              )}
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-primary-500/10 bg-primary-950/20 p-4 md:px-8 md:py-6">
          <div className="group relative flex items-center">
            <input
              type="text"
              placeholder="Seek guidance from the AI Astrologer..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full rounded-2xl border border-primary-500/20 bg-white/5 px-6 py-4 pr-16 text-sm font-medium text-foreground shadow-sm transition-all placeholder:text-primary-100/30 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/5"
              disabled={isSending || isLoadingHistory}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending || isLoadingHistory}
              className="absolute right-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-primary-950 shadow-md shadow-primary-500/30 transition-all hover:bg-primary-600 active:scale-95 disabled:bg-primary-500/20 disabled:text-primary-500/40 disabled:shadow-none"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-primary-500/30">
            Conversations are powered by Astro Intelligence
          </p>
        </div>
      </div>
    </div>
  );
};
