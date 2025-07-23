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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import WelcomeSection from "@/components/common/welcome-section";

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
	return (
		<div className="space-y-8">
			{/* Welcome Section */}
			<WelcomeSection />

			{/* Bento Grid Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Stats Cards - Top Row */}
				<div className="lg:col-span-6">
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

				<div className="lg:col-span-6">
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

				{/* Recent Conversations - Middle Column */}
				<div className="lg:col-span-6">
					<Card className="h-full">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">Recent Sessions</CardTitle>
								<Link href={ROUTES.STUDENT.HISTORY}>
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
							<Link href={ROUTES.STUDENT.HISTORY}>
								<Button
									variant="outline"
									className="w-full mt-4 bg-transparent">
									View All Sessions
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>

				{/* Upcoming Meetings - Right Column */}
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
							<Link href={ROUTES.STUDENT.MEETINGS}>
								<Button
									variant="outline"
									className="w-full mt-4 bg-transparent">
									View All Meetings
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
