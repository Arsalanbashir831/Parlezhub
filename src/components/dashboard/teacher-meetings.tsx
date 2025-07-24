"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Meeting } from "@/hooks/useMeetings";

interface TeacherMeetingsProps {
	meetings: Meeting[];
}

export default function TeacherMeetings({ meetings }: TeacherMeetingsProps) {
	const upcomingMeetings = meetings
		.filter((m) => m.status === "scheduled")
		.slice(0, 5);

	return (
		<div className="lg:col-span-12">
			<Card className="h-full">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg">Your Students & Sessions</CardTitle>
						<Link href={ROUTES.TEACHER.MEETINGS}>
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
					{upcomingMeetings.length > 0 ? (
						upcomingMeetings.map((meeting) => (
							<div
								key={meeting.id}
								className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
								<Avatar className="h-12 w-12">
									<AvatarImage
										src={meeting.studentAvatar || "/placeholder.svg"}
									/>
									<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 font-semibold">
										{meeting.studentName
											? meeting.studentName
													.split(" ")
													.map((n) => n[0])
													.join("")
											: "S"}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
											{meeting.subject}
										</p>
										<Badge variant="outline" className="text-xs">
											{meeting.language}
										</Badge>
									</div>
									<p className="text-xs text-gray-600 dark:text-gray-400">
										with {meeting.studentName || "Student"}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-500">
										{formatDate(meeting.date)} • {meeting.duration}min
									</p>
								</div>
								<div className="text-right">
									<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
										${meeting.price}
									</p>
									<Badge
										variant={
											meeting.status === "scheduled" ? "default" : "secondary"
										}
										className="text-xs">
										{meeting.status}
									</Badge>
								</div>
							</div>
						))
					) : (
						<div className="text-center py-8">
							<p className="text-gray-500 dark:text-gray-400">
								No upcoming sessions
							</p>
						</div>
					)}
					<Link href={ROUTES.TEACHER.MEETINGS}>
						<Button variant="outline" className="w-full mt-4 bg-transparent">
							View All Sessions
						</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
