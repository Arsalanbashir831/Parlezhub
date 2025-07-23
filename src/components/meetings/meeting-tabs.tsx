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
			<TabsList className="grid w-full grid-cols-3">
				<TabsTrigger value="upcoming">Upcoming ({counts.upcoming})</TabsTrigger>
				<TabsTrigger value="completed">
					Completed ({counts.completed})
				</TabsTrigger>
				<TabsTrigger value="cancelled">
					Cancelled ({counts.cancelled})
				</TabsTrigger>
			</TabsList>

			<TabsContent value="upcoming" className="space-y-4 mt-6">
				{filteredMeetings.length > 0 ? (
					filteredMeetings.map((meeting) => {
						const personInfo = getPersonInfo(meeting);
						return (
							<Card
								key={meeting.id}
								className="hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<Avatar className="h-12 w-12">
												<AvatarImage
													src={personInfo.avatar || "/placeholder.svg"}
												/>
												<AvatarFallback className="bg-primary-100 text-primary-700">
													{personInfo.initials}
												</AvatarFallback>
											</Avatar>
											<div>
												<h3 className="font-semibold text-lg">
													{meeting.subject}
												</h3>
												<p className="text-gray-600">{personInfo.withText}</p>
												<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
													<span className="flex items-center gap-1">
														<Calendar className="h-4 w-4" />
														{formatDateTime(meeting.date)}
													</span>
													<span className="flex items-center gap-1">
														<Clock className="h-4 w-4" />
														{meeting.duration} min
													</span>
													<span className="flex items-center gap-1">
														<MapPin className="h-4 w-4" />
														{meeting.location}
													</span>
												</div>
												{meeting.notes && (
													<p className="text-sm text-gray-600 mt-2 italic">
														"{meeting.notes}"
													</p>
												)}
											</div>
										</div>

										<div className="flex items-center gap-3">
											<div className="text-right">
												<Badge
													className={cn(
														"mb-2",
														getStatusColor(meeting.status)
													)}>
													{meeting.status}
												</Badge>
												<p className="text-lg font-bold text-primary-600">
													${meeting.price}
												</p>
											</div>
											<div className="flex flex-col gap-2">
												<Button
													size="sm"
													className="bg-primary-500 hover:bg-primary-600"
													onClick={() => handleJoinMeeting(meeting)}>
													<Video className="h-4 w-4 mr-1" />
													Join
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleMessageTeacher(meeting.id)}>
													<MessageCircle className="h-4 w-4 mr-1" />
													{isTeacher ? "Message" : "Message"}
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

			<TabsContent value="completed" className="space-y-4 mt-6">
				{filteredMeetings.length > 0 ? (
					filteredMeetings.map((meeting) => {
						const personInfo = getPersonInfo(meeting);
						return (
							<Card
								key={meeting.id}
								className="hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<Avatar className="h-12 w-12">
												<AvatarImage
													src={personInfo.avatar || "/placeholder.svg"}
												/>
												<AvatarFallback className="bg-primary-100 text-primary-700">
													{personInfo.initials}
												</AvatarFallback>
											</Avatar>
											<div>
												<h3 className="font-semibold text-lg">
													{meeting.subject}
												</h3>
												<p className="text-gray-600">{personInfo.withText}</p>
												<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
													<span className="flex items-center gap-1">
														<Calendar className="h-4 w-4" />
														{formatDateTime(meeting.date)}
													</span>
													<span className="flex items-center gap-1">
														<Clock className="h-4 w-4" />
														{meeting.duration} min
													</span>
												</div>
												{meeting.feedback && (
													<p className="text-sm text-gray-600 mt-2 italic">
														"{meeting.feedback}"
													</p>
												)}
											</div>
										</div>

										<div className="flex items-center gap-3">
											<div className="text-right">
												<Badge
													className={cn(
														"mb-2",
														getStatusColor(meeting.status)
													)}>
													Completed
												</Badge>
												{meeting.rating && (
													<div className="flex items-center gap-1">
														{[...Array(5)].map((_, i) => (
															<span
																key={i}
																className={`text-sm ${
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

			<TabsContent value="cancelled" className="space-y-4 mt-6">
				{filteredMeetings.length > 0 ? (
					filteredMeetings.map((meeting) => {
						const personInfo = getPersonInfo(meeting);
						return (
							<Card
								key={meeting.id}
								className="hover:shadow-md transition-shadow opacity-75">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<Avatar className="h-12 w-12">
												<AvatarImage
													src={personInfo.avatar || "/placeholder.svg"}
												/>
												<AvatarFallback className="bg-primary-100 text-primary-700">
													{personInfo.initials}
												</AvatarFallback>
											</Avatar>
											<div>
												<h3 className="font-semibold text-lg">
													{meeting.subject}
												</h3>
												<p className="text-gray-600">{personInfo.withText}</p>
												<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
													<span className="flex items-center gap-1">
														<Calendar className="h-4 w-4" />
														{formatDateTime(meeting.date)}
													</span>
													<span className="flex items-center gap-1">
														<Clock className="h-4 w-4" />
														{meeting.duration} min
													</span>
												</div>
												{meeting.cancelReason && (
													<p className="text-sm text-red-600 mt-2">
														Reason: {meeting.cancelReason}
													</p>
												)}
											</div>
										</div>

										<div className="flex items-center gap-3">
											<Badge className={cn(getStatusColor(meeting.status))}>
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
