"use client";

import { useState } from "react";
import {
	Calendar,
	Clock,
	Video,
	MessageCircle,
	Plus,
	Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function TeacherMeetingsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLanguage, setSelectedLanguage] = useState("all");
	const [activeTab, setActiveTab] = useState("upcoming");

	// Mock meetings data
	const meetings = [
		{
			id: "1",
			student: {
				name: "Sarah Johnson",
				avatar: "/placeholder.svg?height=40&width=40",
				level: "Intermediate",
			},
			subject: "Spanish Conversation Practice",
			date: "2024-01-16T15:00:00Z",
			duration: 60,
			status: "scheduled",
			meetingLink: "https://meet.example.com/abc123",
			language: "Spanish",
			price: 35,
			notes: "Focus on past tense conjugations and subjunctive mood",
		},
		{
			id: "2",
			student: {
				name: "Mike Chen",
				avatar: "/placeholder.svg?height=40&width=40",
				level: "Advanced",
			},
			subject: "Business Spanish",
			date: "2024-01-17T10:00:00Z",
			duration: 45,
			status: "scheduled",
			meetingLink: "https://meet.example.com/def456",
			language: "Spanish",
			price: 35,
			notes: "Practice formal business presentations",
		},
		{
			id: "3",
			student: {
				name: "Emma Wilson",
				avatar: "/placeholder.svg?height=40&width=40",
				level: "Beginner",
			},
			subject: "Spanish Grammar Review",
			date: "2024-01-18T14:30:00Z",
			duration: 90,
			status: "scheduled",
			meetingLink: "https://meet.example.com/ghi789",
			language: "Spanish",
			price: 35,
			notes: "Review basic grammar structures",
		},
		{
			id: "4",
			student: {
				name: "Alex Rodriguez",
				avatar: "/placeholder.svg?height=40&width=40",
				level: "Intermediate",
			},
			subject: "Spanish Conversation Practice",
			date: "2024-01-10T15:00:00Z",
			duration: 60,
			status: "completed",
			language: "Spanish",
			price: 35,
			rating: 5,
			feedback:
				"Excellent session! Sofia helped me improve my conversational skills significantly.",
		},
		{
			id: "5",
			student: {
				name: "Lisa Park",
				avatar: "/placeholder.svg?height=40&width=40",
				level: "Advanced",
			},
			subject: "Spanish Literature Discussion",
			date: "2024-01-08T16:00:00Z",
			duration: 75,
			status: "completed",
			language: "Spanish",
			price: 35,
			rating: 4,
			feedback: "Great discussion about Spanish poetry. Very insightful!",
		},
	];

	const handleJoinMeeting = (meeting: any) => {
		if (meeting.meetingLink) {
			window.open(meeting.meetingLink, "_blank");
		}
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
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "completed":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "cancelled":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
		}
	};

	const filteredMeetings = meetings.filter((meeting) => {
		const matchesSearch =
			meeting.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			meeting.subject.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesLanguage =
			selectedLanguage === "all" || meeting.language === selectedLanguage;

		let matchesTab = true;
		if (activeTab === "upcoming") {
			matchesTab =
				meeting.status === "scheduled" && new Date(meeting.date) > new Date();
		} else if (activeTab === "completed") {
			matchesTab = meeting.status === "completed";
		}

		return matchesSearch && matchesLanguage && matchesTab;
	});

	const upcomingCount = meetings.filter(
		(m) => m.status === "scheduled" && new Date(m.date) > new Date()
	).length;
	const completedCount = meetings.filter(
		(m) => m.status === "completed"
	).length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
						My Meetings
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Manage your scheduled lessons with students
					</p>
				</div>
				<Button className="bg-primary-500 hover:bg-primary-600">
					<Plus className="h-4 w-4 mr-2" />
					Schedule New Lesson
				</Button>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium dark:text-gray-100">
							Upcoming Meetings
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold dark:text-gray-100">
							{upcomingCount}
						</div>
						<p className="text-xs text-muted-foreground">
							Next: {upcomingCount > 0 ? "Tomorrow 3:00 PM" : "None scheduled"}
						</p>
					</CardContent>
				</Card>

				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium dark:text-gray-100">
							Completed
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold dark:text-gray-100">
							{completedCount}
						</div>
						<p className="text-xs text-muted-foreground">This month</p>
					</CardContent>
				</Card>

				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium dark:text-gray-100">
							Total Hours
						</CardTitle>
						<Video className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold dark:text-gray-100">
							{Math.round(
								meetings
									.filter((m) => m.status === "completed")
									.reduce((sum, m) => sum + m.duration, 0) / 60
							)}
							h
						</div>
						<p className="text-xs text-muted-foreground">Teaching time</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card className="dark:bg-gray-800 dark:border-gray-700">
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search meetings..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
						</div>
						<Select
							value={selectedLanguage}
							onValueChange={setSelectedLanguage}>
							<SelectTrigger className="w-full md:w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
								<SelectValue placeholder="All languages" />
							</SelectTrigger>
							<SelectContent className="dark:bg-gray-700 dark:border-gray-600">
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
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="upcoming">Upcoming ({upcomingCount})</TabsTrigger>
					<TabsTrigger value="completed">
						Completed ({completedCount})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="upcoming" className="space-y-4 mt-6">
					{filteredMeetings.map((meeting) => (
						<Card
							key={meeting.id}
							className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<Avatar className="h-12 w-12">
											<AvatarImage
												src={meeting.student.avatar || "/placeholder.svg"}
											/>
											<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200">
												{meeting.student.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold text-lg dark:text-gray-100">
												{meeting.subject}
											</h3>
											<p className="text-gray-600 dark:text-gray-400">
												with {meeting.student.name}
											</p>
											<div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
												<span className="flex items-center gap-1">
													<Calendar className="h-4 w-4" />
													{formatDate(meeting.date)}
												</span>
												<span className="flex items-center gap-1">
													<Clock className="h-4 w-4" />
													{meeting.duration} min
												</span>
												<Badge variant="secondary" className="text-xs">
													{meeting.student.level}
												</Badge>
											</div>
											{meeting.notes && (
												<p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
													"{meeting.notes}"
												</p>
											)}
										</div>
									</div>

									<div className="flex items-center gap-3">
										<div className="text-right">
											<Badge
												className={`mb-2 ${getStatusColor(meeting.status)}`}>
												{meeting.status}
											</Badge>
											<p className="text-lg font-bold text-primary-600 dark:text-primary-400">
												${meeting.price}
											</p>
										</div>
										<div className="flex flex-col gap-2">
											<Button
												size="sm"
												className="bg-primary-500 hover:bg-primary-600"
												onClick={() => handleJoinMeeting(meeting)}>
												<Video className="h-4 w-4 mr-1" />
												Start
											</Button>
											<Button variant="outline" size="sm">
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
							className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<Avatar className="h-12 w-12">
											<AvatarImage
												src={meeting.student.avatar || "/placeholder.svg"}
											/>
											<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200">
												{meeting.student.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold text-lg dark:text-gray-100">
												{meeting.subject}
											</h3>
											<p className="text-gray-600 dark:text-gray-400">
												with {meeting.student.name}
											</p>
											<div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
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
												<p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
													"{meeting.feedback}"
												</p>
											)}
										</div>
									</div>

									<div className="flex items-center gap-3">
										<div className="text-right">
											<Badge
												className={`mb-2 ${getStatusColor(meeting.status)}`}>
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
																	: "text-gray-300 dark:text-gray-600"
															}`}>
															★
														</span>
													))}
												</div>
											)}
										</div>
										<Button variant="outline" size="sm">
											Schedule Again
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</TabsContent>
			</Tabs>

			{/* No Results */}
			{filteredMeetings.length === 0 && (
				<Card className="text-center py-12 dark:bg-gray-800 dark:border-gray-700">
					<CardContent>
						<div className="flex flex-col items-center gap-4">
							<div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
								<Calendar className="h-8 w-8 text-gray-400" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									No meetings found
								</h3>
								<p className="text-gray-600 dark:text-gray-400 mt-1">
									{activeTab === "upcoming"
										? "You don't have any upcoming meetings scheduled."
										: `No ${activeTab} meetings match your search criteria`}
								</p>
							</div>
							<Button className="bg-primary-500 hover:bg-primary-600">
								<Plus className="h-4 w-4 mr-2" />
								Schedule New Lesson
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
