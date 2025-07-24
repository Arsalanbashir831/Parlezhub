"use client";

import WelcomeSection from "@/components/common/welcome-section";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useMeetings } from "@/hooks/useMeetings";
import {
	DashboardStatsCards,
	RecentSessions,
	UpcomingMeetings,
	DashboardSkeleton,
} from "@/components/dashboard";

export default function DashboardPage() {
	const { conversations } = useConversationHistory();
	const { meetings } = useMeetings();

	return (
		<div className="space-y-8">
			{/* Welcome Section */}
			<WelcomeSection />

			{/* Bento Grid Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Stats Cards - Top Row */}
				<DashboardStatsCards
					conversations={conversations}
					meetings={meetings}
				/>

				{/* Recent Sessions - Middle Column */}
				<RecentSessions conversations={conversations} />

				{/* Upcoming Meetings - Right Column */}
				<UpcomingMeetings meetings={meetings} />
			</div>
		</div>
	);
}
