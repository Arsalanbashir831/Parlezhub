"use client";

import { Calendar, Clock, Video, MessageCircle, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeetings } from "@/hooks/useMeetings";
import { cn, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import MeetingEmptyCard from "./meeting-empty-card";
import { usePathname } from "next/navigation";

export default function MeetingTabs() {
	const pathname = usePathname();
	const isTeacher = pathname?.includes("/teacher/");

	const {
		activeTab,
		setActiveTab,
		filteredMeetings,
		counts,
		handleJoinMeeting,
		handleMessageTeacher,
		getStatusColor,
	} = useMeetings();

	// Helper function to get the person's name and avatar
	const getPersonInfo = (meeting: any) => {
		if (isTeacher) {
			return {
				name: meeting.studentName,
				avatar: meeting.studentAvatar,
				initials:
					meeting.studentName
						?.split(" ")
						.map((n: string) => n[0])
						.join("") || "S",
				withText: `with ${meeting.studentName}`,
			};
		} else {
			return {
				name: meeting.teacherName,
				avatar: meeting.teacherAvatar,
				initials:
					meeting.teacherName
						?.split(" ")
						.map((n: string) => n[0])
						.join("") || "T",
				withText: `with ${meeting.teacherName}`,
			};
		}
	};

	return (
		<Tabs
			value={activeTab}
			onValueChange={(value) =>
				setActiveTab(value as "upcoming" | "completed" | "cancelled")
			}>
			<TabsList className="grid w-full grid-cols-3 h-auto">
				<TabsTrigger value="upcoming" className="text-xs sm:text-sm">
					<span className="hidden sm:inline">Upcoming</span>
					<span className="sm:hidden">Up</span>
					<span className="ml-1">({counts.upcoming})</span>
				</TabsTrigger>
				<TabsTrigger value="completed" className="text-xs sm:text-sm">
					<span className="hidden sm:inline">Completed</span>
					<span className="sm:hidden">Done</span>
					<span className="ml-1">({counts.completed})</span>
				</TabsTrigger>
				<TabsTrigger value="cancelled" className="text-xs sm:text-sm">
					<span className="hidden sm:inline">Cancelled</span>
					<span className="sm:hidden">Cancel</span>
					<span className="ml-1">({counts.cancelled})</span>
				</TabsTrigger>
			</TabsList>

			<TabsContent
				value="upcoming"
				className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
				{filteredMeetings.length > 0 ? (
					filteredMeetings.map((meeting) => {
						const personInfo = getPersonInfo(meeting);
						return (
							<Card
								key={meeting.id}
								className="hover:shadow-md transition-shadow">
								<CardContent className="p-3 sm:p-4 lg:p-6">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
										<div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
											<Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
												<AvatarImage
													src={personInfo.avatar || "/placeholder.svg"}
												/>
												<AvatarFallback className="bg-primary-100 text-primary-700">
													{personInfo.initials}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-base sm:text-lg truncate">
													{meeting.subject}
												</h3>
												<p className="text-gray-600 text-sm truncate">
													{personInfo.withText}
												</p>
												<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
													<span className="flex items-center gap-1">
														<Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
														<span className="truncate">
															{formatDateTime(meeting.date)}
														</span>
													</span>
													<span className="flex items-center gap-1">
														<Clock className="h-3 w-3 sm:h-4 sm:w-4" />
														{meeting.duration} min
													</span>
													<span className="hidden sm:flex items-center gap-1">
														<MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
														{meeting.location}
													</span>
												</div>
												{meeting.notes && (
													<p className="text-xs sm:text-sm text-gray-600 mt-2 italic line-clamp-2">
														"{meeting.notes}"
													</p>
												)}
											</div>
										</div>

										<div className="flex flex-row sm:flex-col lg:flex-row items-center justify-between sm:justify-end gap-3 flex-shrink-0">
											<div className="text-left sm:text-right">
												<Badge
													className={cn(
														"mb-1 sm:mb-2 text-xs",
														getStatusColor(meeting.status)
													)}>
													{meeting.status}
												</Badge>
												<p className="text-base sm:text-lg font-bold text-primary-600">
													${meeting.price}
												</p>
											</div>
											<div className="flex flex-row sm:flex-col gap-2">
												<Button
													size="sm"
													className="bg-primary-500 hover:bg-primary-600 text-xs sm:text-sm px-2 sm:px-3"
													onClick={() => handleJoinMeeting(meeting)}>
													<Video className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
													<span className="hidden sm:inline">Join</span>
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="text-xs sm:text-sm px-2 sm:px-3"
													onClick={() => handleMessageTeacher(meeting.id)}>
													<MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
													<span className="hidden sm:inline">Message</span>
												</Button>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})
				) : (
					<MeetingEmptyCard />
				)}
			</TabsContent>

			<TabsContent
				value="completed"
				className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
				{filteredMeetings.length > 0 ? (
					filteredMeetings.map((meeting) => {
						const personInfo = getPersonInfo(meeting);
						return (
							<Card
								key={meeting.id}
								className="hover:shadow-md transition-shadow">
								<CardContent className="p-3 sm:p-4 lg:p-6">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
										<div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
											<Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
												<AvatarImage
													src={personInfo.avatar || "/placeholder.svg"}
												/>
												<AvatarFallback className="bg-primary-100 text-primary-700">
													{personInfo.initials}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-base sm:text-lg truncate">
													{meeting.subject}
												</h3>
												<p className="text-gray-600 text-sm truncate">
													{personInfo.withText}
												</p>
												<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
													<span className="flex items-center gap-1">
														<Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
														<span className="truncate">
															{formatDateTime(meeting.date)}
														</span>
													</span>
													<span className="flex items-center gap-1">
														<Clock className="h-3 w-3 sm:h-4 sm:w-4" />
														{meeting.duration} min
													</span>
												</div>
												{meeting.feedback && (
													<p className="text-xs sm:text-sm text-gray-600 mt-2 italic line-clamp-2">
														"{meeting.feedback}"
													</p>
												)}
											</div>
										</div>

										<div className="flex flex-row sm:flex-col items-center justify-between sm:justify-end gap-3 flex-shrink-0">
											<div className="text-left sm:text-right">
												<Badge
													className={cn(
														"mb-1 sm:mb-2 text-xs",
														getStatusColor(meeting.status)
													)}>
													Completed
												</Badge>
												{meeting.rating && (
													<div className="flex items-center gap-1 justify-start sm:justify-end">
														{[...Array(5)].map((_, i) => (
															<span
																key={i}
																className={`text-xs sm:text-sm ${
																	i < (meeting.rating ?? 0)
																		? "text-yellow-400"
																		: "text-gray-300"
																}`}>
																★
															</span>
														))}
													</div>
												)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})
				) : (
					<MeetingEmptyCard />
				)}
			</TabsContent>

			<TabsContent
				value="cancelled"
				className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
				{filteredMeetings.length > 0 ? (
					filteredMeetings.map((meeting) => {
						const personInfo = getPersonInfo(meeting);
						return (
							<Card
								key={meeting.id}
								className="hover:shadow-md transition-shadow opacity-75">
								<CardContent className="p-3 sm:p-4 lg:p-6">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
										<div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
											<Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
												<AvatarImage
													src={personInfo.avatar || "/placeholder.svg"}
												/>
												<AvatarFallback className="bg-primary-100 text-primary-700">
													{personInfo.initials}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-base sm:text-lg truncate">
													{meeting.subject}
												</h3>
												<p className="text-gray-600 text-sm truncate">
													{personInfo.withText}
												</p>
												<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
													<span className="flex items-center gap-1">
														<Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
														<span className="truncate">
															{formatDateTime(meeting.date)}
														</span>
													</span>
													<span className="flex items-center gap-1">
														<Clock className="h-3 w-3 sm:h-4 sm:w-4" />
														{meeting.duration} min
													</span>
												</div>
												{meeting.cancelReason && (
													<p className="text-xs sm:text-sm text-red-600 mt-2 line-clamp-2">
														Reason: {meeting.cancelReason}
													</p>
												)}
											</div>
										</div>

										<div className="flex items-center justify-end flex-shrink-0">
											<Badge
												className={cn(
													"text-xs",
													getStatusColor(meeting.status)
												)}>
												Cancelled
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})
				) : (
					<MeetingEmptyCard />
				)}
			</TabsContent>
		</Tabs>
	);
}
