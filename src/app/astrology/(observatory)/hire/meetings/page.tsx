import { MeetingsProvider } from '@/contexts/meetings-context';

import MeetingFilters from '@/components/meetings/meeting-filters';
import MeetingHeader from '@/components/meetings/meeting-header';
import MeetingStats from '@/components/meetings/meeting-stats';
import MeetingTabs from '@/components/meetings/meeting-tabs';

export default function MeetingsPage() {
  return (
    <MeetingsProvider>
      <div className="space-y-6">
        {/* Header */}
        <MeetingHeader description="Manage your astrology consultations and upcoming calls." />

        {/* Quick Stats */}
        <MeetingStats />

        {/* Filters */}
        <MeetingFilters />

        {/* Meetings Tabs */}
        <MeetingTabs />
      </div>
    </MeetingsProvider>
  );
}
