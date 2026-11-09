'use client';

import { useAuth } from '@/contexts/auth-context';
import { MeetingsProvider } from '@/contexts/meetings-context';
import { PageHeader } from '@/components/parlezhub/ui';
import { MeetingsView } from '@/components/parlezhub/meetings/meetings-view';

/** /parlezhub/meetings — booked sessions, for whichever profile is active. */
export default function MeetingsPage() {
  const { activeRole } = useAuth();
  const isConsultant = activeRole === 'TEACHER';
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isConsultant ? 'Language Consultant' : 'Learner'}
        title="Meetings"
        description={
          isConsultant
            ? 'Approve booking requests and join your sessions with learners.'
            : 'Your sessions with language consultants: pay, join, reschedule or cancel.'
        }
      />
      <MeetingsProvider>
        <MeetingsView />
      </MeetingsProvider>
    </div>
  );
}
