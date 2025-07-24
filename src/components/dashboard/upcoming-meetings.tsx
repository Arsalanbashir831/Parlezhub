"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Meeting } from "@/hooks/useMeetings";

interface UpcomingMeetingsProps {
	meetings: Meeting[];
}

export default function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
	const upcomingMeetings = meetings
		.filter((m) => m.status === "scheduled")
		.slice(0, 5);

	return (
		<div className="lg:col-span-6">
			<Card className="h-full">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg">Upcoming Meetings</CardTitle>
						<Link href={ROUTES.STUDENT.MEETINGS}>
							<Button
								variant="ghost"
								size="sm"
								className="text-primary-600 hover:text-primary-700">
								<ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{upcomingMeetings.map((meeting) => (
						<div
							key={meeting.id}
							className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
							<Avatar className="h-12 w-12">
								<AvatarImage
									src={meeting.teacherAvatar || "/placeholder.svg"}
								/>
								<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 font-semibold">
									{meeting.teacherName
										? meeting.teacherName
												.split(" ")
												.map((n) => n[0])
												.join("")
										: "T"}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
									{meeting.subject}
								</p>
								<p className="text-xs text-gray-600 dark:text-gray-400">
									with {meeting.teacherName || "Teacher"}
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-500">
									{formatDate(meeting.date)}
								</p>
							</div>
						</div>
					))}
					<Link href={ROUTES.STUDENT.MEETINGS}>
						<Button variant="outline" className="w-full mt-4 bg-transparent">
							View All Meetings
						</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
