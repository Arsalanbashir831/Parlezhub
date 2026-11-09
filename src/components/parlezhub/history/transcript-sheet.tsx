'use client';

import { format } from 'date-fns';

import { tutorLanguageLabel } from '@/constants/tutor';
import type { VoiceConversationResponse } from '@/services/voice';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

/** One saved tutor conversation, read back turn by turn. */
export function TranscriptSheet({
  conversation,
  onClose,
}: {
  conversation: VoiceConversationResponse | null;
  onClose: () => void;
}) {
  const messages = conversation?.transcription?.messages ?? [];
  const language = tutorLanguageLabel(conversation?.target_language);

  return (
    <Sheet open={Boolean(conversation)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 border-l border-border bg-card p-0 sm:max-w-lg">
        {conversation && (
          <>
            <SheetHeader className="space-y-1 border-b border-border px-6 py-5 text-left">
              <SheetTitle className="pr-8 text-lg font-extrabold text-foreground">
                {conversation.topic || 'Conversation'}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                <span aria-hidden="true">{language.flag}</span> {language.label} ·{' '}
                {format(new Date(conversation.created_at), 'd MMM yyyy, HH:mm')}
                {conversation.duration_minutes ? ` · ${conversation.duration_minutes} min` : ''}
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-background/40 px-6 py-5">
              {messages.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No transcript was saved for this conversation.
                </p>
              )}
              {messages.map((message, index) =>
                message.role === 'assistant' ? (
                  <div key={index} className="flex">
                    <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-border bg-card px-4 py-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Tutor</p>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {message.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div key={index} className="flex justify-end">
                    <p className="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                      {message.text}
                    </p>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
