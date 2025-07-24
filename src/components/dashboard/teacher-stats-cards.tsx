"use client";

import { MessageSquare, CalendarIcon, TrendingUp, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Meeting } from "@/hooks/useMeetings";

interface TeacherStatsCardsProps {
	meetings: Meeting[];
}

export default function TeacherStatsCards({
	meetings,
}: TeacherStatsCardsProps) {
	const totalMeetings = meetings.length;
	const upcomingMeetings = meetings.filter(
		(m) => m.status === "scheduled"
	).length;
	const completedMeetings = meetings.filter((m) => m.status === "completed");

	// Calculate average rating from completed meetings
	const averageRating =
		completedMeetings.length > 0
			? completedMeetings.reduce((sum, m) => sum + (m.rating || 0), 0) /
			  completedMeetings.length
			: 0;

	return (
		<>
			{/* Average Rating Card */}
			<div className="lg:col-span-6">
				<Card className="h-full bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<div className="p-3 bg-yellow-500 rounded-xl">
								<Star className="h-6 w-6 text-white" />
							</div>
							<TrendingUp className="h-5 w-5 text-yellow-600" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
								Average Rating
							</p>
							<p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
								{averageRating.toFixed(1)}
							</p>
							<p className="text-xs text-yellow-600 dark:text-yellow-400">
								Based on {completedMeetings.length} reviews
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Upcoming Meetings Card */}
			<div className="lg:col-span-6">
				<Card className="h-full bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<div className="p-3 bg-purple-500 rounded-xl">
								<CalendarIcon className="h-6 w-6 text-white" />
							</div>
							<TrendingUp className="h-5 w-5 text-purple-600" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium text-purple-700 dark:text-purple-300">
								Upcoming Sessions
							</p>
							<p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
								{upcomingMeetings}
							</p>
							<p className="text-xs text-purple-600 dark:text-purple-400">
								Next: Tomorrow 3:00 PM
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
