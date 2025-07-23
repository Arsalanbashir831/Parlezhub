import MeetingHeader from "@/components/meetings/meeting-header";
import MeetingStats from "@/components/meetings/meeting-stats";
import MeetingFilters from "@/components/meetings/meeting-filters";
import MeetingTabs from "@/components/meetings/meeting-tabs";

export default function MeetingsPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<MeetingHeader />

			{/* Quick Stats */}
			<MeetingStats />

			{/* Filters */}
			<MeetingFilters />

			{/* Meetings Tabs */}
			<MeetingTabs />
		</div>
	);
}
