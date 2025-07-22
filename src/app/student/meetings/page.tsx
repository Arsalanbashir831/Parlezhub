"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Search,
	Calendar,
	Clock,
	Video,
	MessageCircle,
	Plus,
	MapPin,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

// Mock meetings data
const mockMeetings = [
	{
		id: "1",
		teacherName: "Maria Rodriguez",
		teacherAvatar: "/placeholder.svg?height=40&width=40",
		subject: "Spanish Grammar Review",
		date: "2024-01-16T15:00:00Z",
		duration: 60,
		status: "scheduled",
		meetingLink: "https://meet.example.com/abc123",
		language: "Spanish",
		price: 25,
		location: "Online",
		notes: "Focus on past tense conjugations and subjunctive mood",
	},
	{
		id: "2",
		teacherName: "Jean Dubois",
		teacherAvatar: "/placeholder.svg?height=40&width=40",
		subject: "French Pronunciation",
		date: "2024-01-17T10:00:00Z",
		duration: 45,
		status: "scheduled",
		meetingLink: "https://meet.example.com/def456",
		language: "French",
		price: 30,
		location: "Online",
		notes: "Work on nasal vowels and liaison",
	},
	{
		id: "3",
		teacherName: "Hans Mueller",
		teacherAvatar: "/placeholder.svg?height=40&width=40",
		subject: "German Business Conversation",
		date: "2024-01-18T14:30:00Z",
		duration: 90,
		status: "scheduled",
		meetingLink: "https://meet.example.com/ghi789",
		language: "German",
		price: 35,
		location: "Online",
		notes: "Practice formal business presentations",
	},
	{
		id: "4",
		teacherName: "Maria Rodriguez",
		teacherAvatar: "/placeholder.svg?height=40&width=40",
		subject: "Spanish Conversation Practice",
		date: "2024-01-10T15:00:00Z",
		duration: 60,
		status: "completed",
		language: "Spanish",
		price: 25,
		location: "Online",
		rating: 5,
		feedback:
			"Excellent session! Maria helped me improve my conversational skills significantly.",
	},
	{
		id: "5",
		teacherName: "Jean Dubois",
		teacherAvatar: "/placeholder.svg?height=40&width=40",
		subject: "French Literature Discussion",
		date: "2024-01-08T16:00:00Z",
		duration: 75,
		status: "completed",
		language: "French",
		price: 30,
		location: "Online",
		rating: 4,
		feedback: "Great discussion about French poetry. Very insightful!",
	},
	{
		id: "6",
		teacherName: "Sofia Rossi",
		teacherAvatar: "/placeholder.svg?height=40&width=40",
		subject: "Italian Cooking Vocabulary",
		date: "2024-01-05T11:00:00Z",
		duration: 45,
		status: "cancelled",
		language: "Italian",
		price: 28,
		location: "Online",
		cancelReason: "Teacher unavailable due to illness",
	},
];

export default function MeetingsPage() {
	const [meetings, setMeetings] = useState(mockMeetings);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLanguage, setSelectedLanguage] = useState("all");
	const [activeTab, setActiveTab] = useState("upcoming");
	const router = useRouter();

	const handleJoinMeeting = (meeting: any) => {
		if (meeting.meetingLink) {
			window.open(meeting.meetingLink, "_blank");
		}
	};

	const handleMessageTeacher = (teacherId: string) => {
		router.push(ROUTES.STUDENT.MESSAGES + "?teacher=" + teacherId);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const isToday = date.toDateString() === now.toDateString();
		const isTomorrow =
			date.toDateString() ===
			new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

		let dateLabel = "";
		if (isToday) dateLabel = "Today";
		else if (isTomorrow) dateLabel = "Tomorrow";
		else
			dateLabel = date.toLocaleDateString([], {
				month: "short",
				day: "numeric",
			});

		const timeLabel = date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

		return `${dateLabel} at ${timeLabel}`;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "scheduled":
				return "bg-blue-100 text-blue-800";
			case "completed":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const filteredMeetings = meetings.filter((meeting) => {
		const matchesSearch =
			meeting.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			meeting.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
			meeting.language.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesLanguage =
			selectedLanguage === "all" || meeting.language === selectedLanguage;

		let matchesTab = true;
		if (activeTab === "upcoming") {
			matchesTab =
				meeting.status === "scheduled" && new Date(meeting.date) > new Date();
		} else if (activeTab === "completed") {
			matchesTab = meeting.status === "completed";
		} else if (activeTab === "cancelled") {
			matchesTab = meeting.status === "cancelled";
		}

		return matchesSearch && matchesLanguage && matchesTab;
	});

	const upcomingCount = meetings.filter(
		(m) => m.status === "scheduled" && new Date(m.date) > new Date()
	).length;
	const completedCount = meetings.filter(
		(m) => m.status === "completed"
	).length;
	const cancelledCount = meetings.filter(
		(m) => m.status === "cancelled"
	).length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">My Meetings</h1>
					<p className="text-gray-600">
						Manage your scheduled lessons with teachers
					</p>
				</div>
				<Link href={ROUTES.STUDENT.TEACHERS}>
					<Button className="bg-primary-500 hover:bg-primary-600">
						<Plus className="h-4 w-4 mr-2" />
						Book New Lesson
					</Button>
				</Link>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Upcoming Meetings
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{upcomingCount}</div>
						<p className="text-xs text-muted-foreground">
							Next: {upcomingCount > 0 ? "Tomorrow 3:00 PM" : "None scheduled"}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{completedCount}</div>
						<p className="text-xs text-muted-foreground">This month</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Hours</CardTitle>
						<Video className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{Math.round(
								meetings
									.filter((m) => m.status === "completed")
									.reduce((sum, m) => sum + m.duration, 0) / 60
							)}
							h
						</div>
						<p className="text-xs text-muted-foreground">Learning time</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search meetings..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select
							value={selectedLanguage}
							onValueChange={setSelectedLanguage}>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue placeholder="All languages" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All languages</SelectItem>
								<SelectItem value="Spanish">Spanish</SelectItem>
								<SelectItem value="French">French</SelectItem>
								<SelectItem value="German">German</SelectItem>
								<SelectItem value="Italian">Italian</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Meetings Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="upcoming">Upcoming ({upcomingCount})</TabsTrigger>
					<TabsTrigger value="completed">
						Completed ({completedCount})
					</TabsTrigger>
					<TabsTrigger value="cancelled">
						Cancelled ({cancelledCount})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="upcoming" className="space-y-4 mt-6">
					{filteredMeetings.map((meeting) => (
						<Card
							key={meeting.id}
							className="hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<Avatar className="h-12 w-12">
											<AvatarImage
												src={meeting.teacherAvatar || "/placeholder.svg"}
											/>
											<AvatarFallback className="bg-primary-100 text-primary-700">
												{meeting.teacherName
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold text-lg">
												{meeting.subject}
											</h3>
											<p className="text-gray-600">
												with {meeting.teacherName}
											</p>
											<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
												<span className="flex items-center gap-1">
													<Calendar className="h-4 w-4" />
													{formatDate(meeting.date)}
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
												className={cn("mb-2", getStatusColor(meeting.status))}>
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
												Message
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</TabsContent>

				<TabsContent value="completed" className="space-y-4 mt-6">
					{filteredMeetings.map((meeting) => (
						<Card
							key={meeting.id}
							className="hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<Avatar className="h-12 w-12">
											<AvatarImage
												src={meeting.teacherAvatar || "/placeholder.svg"}
											/>
											<AvatarFallback className="bg-primary-100 text-primary-700">
												{meeting.teacherName
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold text-lg">
												{meeting.subject}
											</h3>
											<p className="text-gray-600">
												with {meeting.teacherName}
											</p>
											<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
												<span className="flex items-center gap-1">
													<Calendar className="h-4 w-4" />
													{formatDate(meeting.date)}
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
												className={cn("mb-2", getStatusColor(meeting.status))}>
												Completed
											</Badge>
											{meeting.rating && (
												<div className="flex items-center gap-1">
													{[...Array(5)].map((_, i) => (
														<span
															key={i}
															className={`text-sm ${
																i < meeting.rating
																	? "text-yellow-400"
																	: "text-gray-300"
															}`}>
															★
														</span>
													))}
												</div>
											)}
										</div>
										<Link
											href={
												ROUTES.STUDENT.TEACHERS +
												"?teacher=" +
												meeting.teacherName
											}>
											<Button variant="outline" size="sm">
												Book Again
											</Button>
										</Link>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</TabsContent>

				<TabsContent value="cancelled" className="space-y-4 mt-6">
					{filteredMeetings.map((meeting) => (
						<Card
							key={meeting.id}
							className="hover:shadow-md transition-shadow opacity-75">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<Avatar className="h-12 w-12">
											<AvatarImage
												src={meeting.teacherAvatar || "/placeholder.svg"}
											/>
											<AvatarFallback className="bg-primary-100 text-primary-700">
												{meeting.teacherName
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold text-lg">
												{meeting.subject}
											</h3>
											<p className="text-gray-600">
												with {meeting.teacherName}
											</p>
											<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
												<span className="flex items-center gap-1">
													<Calendar className="h-4 w-4" />
													{formatDate(meeting.date)}
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
										<Link
											href={
												ROUTES.STUDENT.TEACHERS +
												"?teacher=" +
												meeting.teacherName
											}>
											<Button variant="outline" size="sm">
												Rebook
											</Button>
										</Link>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</TabsContent>
			</Tabs>

			{/* No Results */}
			{filteredMeetings.length === 0 && (
				<Card className="text-center py-12">
					<CardContent>
						<div className="flex flex-col items-center gap-4">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
								<Calendar className="h-8 w-8 text-gray-400" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									No meetings found
								</h3>
								<p className="text-gray-600 mt-1">
									{activeTab === "upcoming"
										? "You don't have any upcoming meetings. Book a lesson with a teacher!"
										: `No ${activeTab} meetings match your search criteria`}
								</p>
							</div>
							<Link href={ROUTES.STUDENT.TEACHERS}>
								<Button className="bg-primary-500 hover:bg-primary-600">
									Find Teachers
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
