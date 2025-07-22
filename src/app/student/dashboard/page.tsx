"use client";

import { useState, useEffect } from "react";
import {
	MessageSquare,
	CalendarIcon,
	Clock,
	Award,
	BookOpen,
	Plus,
	ArrowRight,
	TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data
const mockStats = {
	totalConversations: 24,
	totalMinutes: 180,
	upcomingMeetings: 2,
	currentStreak: 7,
	languagesLearning: [
		{ name: "Spanish", level: "Intermediate", progress: 75 },
		{ name: "French", level: "Beginner", progress: 45 },
	],
};

const recentConversations = [
	{
		id: "1",
		avatarName: "Alex",
		language: "Spanish",
		duration: 15,
		score: 85,
		date: "2024-01-15T10:30:00Z",
		topic: "Restaurant Conversation",
	},
	{
		id: "2",
		avatarName: "Alex",
		language: "French",
		duration: 20,
		score: 92,
		date: "2024-01-14T14:15:00Z",
		topic: "Travel Planning",
	},
];

const upcomingMeetings = [
	{
		id: "1",
		teacherName: "Maria Rodriguez",
		subject: "Spanish Grammar Review",
		date: "2024-01-16T15:00:00Z",
		duration: 60,
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		id: "2",
		teacherName: "Jean Dubois",
		subject: "French Pronunciation",
		date: "2024-01-17T10:00:00Z",
		duration: 45,
		avatar: "/placeholder.svg?height=40&width=40",
	},
];

export default function DashboardPage() {
	const [currentTime, setCurrentTime] = useState(new Date());
	const router = useRouter();

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString([], {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-8">
			{/* Welcome Section */}
			<div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-8 text-white relative overflow-hidden">
				<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
				<div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
				<div className="relative z-10">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
						<div className="space-y-2">
							<h1 className="text-3xl lg:text-4xl font-bold">
								Welcome back! 👋
							</h1>
							<p className="text-primary-100 text-lg">
								Ready to continue your language learning journey?
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4">
							<Button
								size="lg"
								variant="secondary"
								className="bg-white text-primary-600 hover:bg-white/90 font-semibold"
								onClick={() => router.push("/dashboard/ai-tutor")}>
								<Plus className="h-5 w-5 mr-2" />
								Start AI Session
							</Button>
							<div className="text-right lg:text-left">
								<p className="text-primary-100 text-sm">Current Time</p>
								<p className="text-2xl font-bold">{formatTime(currentTime)}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bento Grid Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Stats Cards - Top Row */}
				<div className="lg:col-span-3">
					<Card className="h-full bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="p-3 bg-blue-500 rounded-xl">
									<MessageSquare className="h-6 w-6 text-white" />
								</div>
								<TrendingUp className="h-5 w-5 text-blue-600" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium text-blue-700">
									Total Conversations
								</p>
								<p className="text-3xl font-bold text-blue-900">
									{mockStats.totalConversations}
								</p>
								<p className="text-xs text-blue-600">+3 from last week</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="lg:col-span-3">
					<Card className="h-full bg-gradient-to-br from-green-50 to-green-100 border-green-200">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="p-3 bg-green-500 rounded-xl">
									<Clock className="h-6 w-6 text-white" />
								</div>
								<TrendingUp className="h-5 w-5 text-green-600" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium text-green-700">
									Practice Time
								</p>
								<p className="text-3xl font-bold text-green-900">
									{mockStats.totalMinutes}m
								</p>
								<p className="text-xs text-green-600">This month</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="lg:col-span-3">
					<Card className="h-full bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="p-3 bg-purple-500 rounded-xl">
									<CalendarIcon className="h-6 w-6 text-white" />
								</div>
								<TrendingUp className="h-5 w-5 text-purple-600" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium text-purple-700">
									Upcoming Meetings
								</p>
								<p className="text-3xl font-bold text-purple-900">
									{mockStats.upcomingMeetings}
								</p>
								<p className="text-xs text-purple-600">
									Next: Tomorrow 3:00 PM
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="lg:col-span-3">
					<Card className="h-full bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="p-3 bg-orange-500 rounded-xl">
									<Award className="h-6 w-6 text-white" />
								</div>
								<TrendingUp className="h-5 w-5 text-orange-600" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium text-orange-700">
									Current Streak
								</p>
								<p className="text-3xl font-bold text-orange-900">
									{mockStats.currentStreak} days
								</p>
								<p className="text-xs text-orange-600">Keep it up! 🔥</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Languages Learning - Left Column */}
				<div className="lg:col-span-4">
					<Card className="h-full">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<BookOpen className="h-5 w-5 text-primary-600" />
									<CardTitle className="text-lg">Your Languages</CardTitle>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => router.push("/dashboard/ai-tutor")}
									className="text-primary-600 hover:text-primary-700">
									<ArrowRight className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{mockStats.languagesLearning.map((language) => (
								<div key={language.name} className="space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-semibold text-gray-900">
												{language.name}
											</p>
											<p className="text-sm text-gray-600">{language.level}</p>
										</div>
										<Badge
											variant="secondary"
											className="bg-primary-100 text-primary-700">
											{language.progress}%
										</Badge>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-primary-500 h-2 rounded-full transition-all duration-300"
											style={{ width: `${language.progress}%` }}></div>
									</div>
								</div>
							))}
							<Button
								variant="outline"
								className="w-full mt-4 border-dashed border-2 border-gray-300 hover:border-primary-300 hover:bg-primary-50 bg-transparent"
								onClick={() => router.push("/dashboard/ai-tutor")}>
								<Plus className="h-4 w-4 mr-2" />
								Add Language
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Recent Conversations - Middle Column */}
				<div className="lg:col-span-4">
					<Card className="h-full">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">Recent Sessions</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => router.push("/dashboard/conversations")}
									className="text-primary-600 hover:text-primary-700">
									<ArrowRight className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{recentConversations.map((conversation) => (
								<div
									key={conversation.id}
									className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
									<Avatar className="h-12 w-12">
										<AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
											{conversation.avatarName.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm text-gray-900 truncate">
											{conversation.topic}
										</p>
										<p className="text-xs text-gray-600">
											{conversation.language} • {conversation.duration}m
										</p>
									</div>
									<Badge
										variant={conversation.score >= 85 ? "default" : "secondary"}
										className="text-xs">
										{conversation.score}%
									</Badge>
								</div>
							))}
							<Button
								variant="outline"
								className="w-full mt-4 bg-transparent"
								onClick={() => router.push("/dashboard/conversations")}>
								View All Sessions
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Upcoming Meetings - Right Column */}
				<div className="lg:col-span-4">
					<Card className="h-full">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">Upcoming Meetings</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => router.push("/dashboard/meetings")}
									className="text-primary-600 hover:text-primary-700">
									<ArrowRight className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{upcomingMeetings.map((meeting) => (
								<div
									key={meeting.id}
									className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
									<Avatar className="h-12 w-12">
										<AvatarImage src={meeting.avatar || "/placeholder.svg"} />
										<AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
											{meeting.teacherName
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm text-gray-900 truncate">
											{meeting.subject}
										</p>
										<p className="text-xs text-gray-600">
											with {meeting.teacherName}
										</p>
										<p className="text-xs text-gray-500">
											{formatDate(meeting.date)}
										</p>
									</div>
								</div>
							))}
							<Button
								variant="outline"
								className="w-full mt-4 bg-transparent"
								onClick={() => router.push("/dashboard/meetings")}>
								View All Meetings
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
