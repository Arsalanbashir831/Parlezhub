'use client';

import { useAuth } from '@/contexts/auth-context';
import ConsultationChatView from '@/components/chat/consultation-chat-view';

/**
 * /parlezhub/chat — messages between learners and language consultants. The
 * shared chat view, themed by ParlezHub's tokens; booking from a chat offers
 * the consultant's language gigs only.
 */
export default function ParlezhubChatPage() {
  const { activeRole } = useAuth();
  return (
    <div className="ph-fill flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <ConsultationChatView
        // Remount on a profile switch, so one profile's open chat never lingers.
        key={activeRole ?? 'none'}
        role={activeRole === 'TEACHER' ? 'consultant' : 'student'}
        category="language"
      />
    </div>
  );
}
