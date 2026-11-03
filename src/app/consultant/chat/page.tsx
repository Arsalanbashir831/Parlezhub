'use client';

import ConsultationChatView from '@/components/chat/consultation-chat-view';

// This is the student's chat surface, and its colour comes from the cosmic
// tokens that the observatory shell defines. Re-declaring them here puts both
// sides of a consultation on the same screen, in the same theme, instead of
// leaving the consultant side with unset variables.
export default function ConsultantChatPage() {
  return (
    <div className="observatory-theme flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border">
      <ConsultationChatView role="consultant" />
    </div>
  );
}
