'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, User, MessageSquare, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useAstrologyAIChat } from '@/hooks/useAstrologyAIChat';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FloatingAIAstrologerProps {
  category: string;
  studentId?: string;
  guestProfileId?: string;
}

export const FloatingAIAstrologer: React.FC<FloatingAIAstrologerProps> = ({
  category,
  studentId,
  guestProfileId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const { messages, isSending, isLoadingHistory, error, sendMessage } =
    useAstrologyAIChat(category, studentId, guestProfileId);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isSending, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const currentContextName = React.useMemo(() => {
    if (category === 'd1-chart') return 'D1 Chart';
    if (category === 'd9-chart') return 'D9 Navamsa';
    if (category === 'navatara') return 'Navatara';
    if (category === 'birth-profile') return 'Birth Profile';
    return category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }, [category]);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-primary-950 shadow-lg shadow-primary-500/30 transition-all hover:scale-105 hover:bg-primary-600 active:scale-95 md:bottom-10 md:right-10"
        >
          <Sparkles className="absolute h-14 w-14 animate-ping opacity-20" />
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[500px] w-[350px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-primary-500/20 bg-background/95 shadow-2xl backdrop-blur-xl md:bottom-10 md:right-10 md:h-[600px] md:w-[400px]">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-primary-500/20 bg-primary-950/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-primary-950 shadow-sm shadow-primary-500/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-primary-300">
                  AI Astrologer
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500/70">
                  {currentContextName} Context
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-primary-100/60 transition-colors hover:bg-primary-500/10 hover:text-primary-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Message Container */}
          <ScrollArea className="flex-1 p-4">
            {isLoadingHistory ? (
              <div className="flex h-full flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500/40" />
                <p className="mt-4 text-center font-serif text-xs italic text-primary-100/40">
                  Connecting to Akashic Records...
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center opacity-40">
                <Sparkles className="mb-4 h-10 w-10 text-primary-500 drop-shadow-sm" />
                <p className="max-w-[200px] font-serif text-sm italic text-primary-100/60">
                  &ldquo;Ask me anything about your {currentContextName}...&rdquo;
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`flex w-full gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${msg.role === 'user' ? 'border border-primary-500/20 bg-primary-500/10 text-primary-300' : 'bg-primary-500 text-primary-950 shadow-sm shadow-primary-500/20'}`}
                    >
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`flex max-w-[75%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : ''}`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm ${msg.role === 'user' ? 'rounded-tr-none border border-primary-500/20 bg-primary-500/10 text-primary-100' : 'bg-white/5 rounded-tl-none border border-primary-500/10 text-primary-300'}`}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="ai-chat-markdown prose prose-sm prose-invert max-w-none text-[13px] leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-[13px] font-medium leading-relaxed">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-primary-950 shadow-sm shadow-primary-500/20">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-primary-500/10 bg-white/5 px-4 py-2">
                      <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
                      <span className="text-xs italic text-primary-100/60">
                        Reading signs...
                      </span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-center">
                    <p className="text-xs font-bold text-red-400">{error}</p>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-primary-500/20 bg-primary-950/40 p-3">
            <div className="group relative flex items-center">
              <input
                type="text"
                placeholder="Ask about this context..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="w-full rounded-xl border border-primary-500/20 bg-white/5 px-4 py-3 pr-12 text-sm font-medium text-foreground shadow-sm transition-all placeholder:text-primary-100/30 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                disabled={isSending || isLoadingHistory}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isSending || isLoadingHistory}
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-primary-950 shadow-sm shadow-primary-500/30 transition-all hover:bg-primary-600 active:scale-95 disabled:bg-primary-500/20 disabled:text-primary-500/40 disabled:shadow-none"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
