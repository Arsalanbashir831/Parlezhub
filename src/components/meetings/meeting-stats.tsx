"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetings } from "@/hooks/useMeetings";
import { Calendar, Clock, Video } from "lucide-react";

export default function MeetingStats() {
	const { counts, nextUpcomingLabel, totalCompletedHours } = useMeetings();
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Upcoming Meetings
					</CardTitle>
					<Calendar className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{counts.upcoming}</div>
					<p className="text-xs text-muted-foreground">
						Next: {nextUpcomingLabel}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Completed</CardTitle>
					<Clock className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{counts.completed}</div>
					<p className="text-xs text-muted-foreground">This month</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Hours</CardTitle>
					<Video className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{totalCompletedHours}h</div>
					<p className="text-xs text-muted-foreground">Learning time</p>
				</CardContent>
			</Card>
		</div>
	);
}
