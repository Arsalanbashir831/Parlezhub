'use client';

import { useConversationHistory } from '@/hooks/useConversationHistory';
import { useMeetings } from '@/hooks/useMeetings';
import WelcomeSection from '@/components/common/welcome-section';
import {
  DashboardStatsCards,
  RecentSessions,
  UpcomingMeetings,
} from '@/components/dashboard';

export default function DashboardPage() {
  const { conversations } = useConversationHistory();
  const { meetings } = useMeetings();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeSection />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Stats Cards - Top Row */}
        <DashboardStatsCards
          conversations={conversations}
        />

        {/* Recent Sessions - Middle Column */}
        <RecentSessions conversations={conversations} />

        {/* Upcoming Meetings - Right Column */}
        <UpcomingMeetings meetings={meetings} />
      </div>
    </div>
  );
}
