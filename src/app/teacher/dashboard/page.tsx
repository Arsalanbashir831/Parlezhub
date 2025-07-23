"use client";

import {
	Calendar,
	Users,
	MessageCircle,
	Clock,
	Star,
	BookOpen,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import WelcomeSection from "@/components/common/welcome-section";

export default function TeacherDashboardPage() {
	const router = useRouter();

	// Mock data
	const stats = {
		totalStudents: 24,
		activeStudents: 18,
		completedLessons: 156,
		upcomingLessons: 8,
		averageRating: 4.8,
		responseRate: 95,
	};

	const upcomingLessons = [
		{
			id: 1,
			student: "Sarah Johnson",
			avatar: "/placeholder.svg",
			time: "10:00 AM",
			duration: "60 min",
			subject: "Spanish Conversation",
			level: "Intermediate",
		},
		{
			id: 2,
			student: "Mike Chen",
			avatar: "/placeholder.svg",
			time: "2:00 PM",
			duration: "45 min",
			subject: "Business Spanish",
			level: "Advanced",
		},
		{
			id: 3,
			student: "Emma Wilson",
			avatar: "/placeholder.svg",
			time: "4:30 PM",
			duration: "60 min",
			subject: "Spanish Grammar",
			level: "Beginner",
		},
	];

	const recentMessages = [
		{
			id: 1,
			student: "Alex Rodriguez",
			avatar: "/placeholder.svg",
			message:
				"Thank you for the great lesson yesterday! When can we schedule the next one?",
			time: "2 hours ago",
			unread: true,
		},
		{
			id: 2,
			student: "Lisa Park",
			avatar: "/placeholder.svg",
			message: "I have a question about the homework you assigned...",
			time: "5 hours ago",
			unread: true,
		},
		{
			id: 3,
			student: "David Kim",
			avatar: "/placeholder.svg",
			message: "Could we reschedule tomorrow's lesson to 3 PM?",
			time: "1 day ago",
			unread: false,
		},
	];

	return (
		<div className="space-y-8">
			{/* Welcome Section */}
			<WelcomeSection
				subtitle="Here's your teaching overview for today."
				showButton={false}
			/>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Total Students
								</p>
								<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
									{stats.totalStudents}
								</p>
								<p className="text-sm text-green-600 dark:text-green-400 mt-1">
									+3 this month
								</p>
							</div>
							<div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
								<Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Completed Lessons
								</p>
								<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
									{stats.completedLessons}
								</p>
								<p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
									{stats.upcomingLessons} upcoming
								</p>
							</div>
							<div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
								<BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Average Rating
								</p>
								<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
									{stats.averageRating}
								</p>
								<div className="flex items-center mt-1">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`h-4 w-4 ${
												i < Math.floor(stats.averageRating)
													? "text-yellow-400 fill-current"
													: "text-gray-300 dark:text-gray-600"
											}`}
										/>
									))}
								</div>
							</div>
							<div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
								<Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Response Rate
								</p>
								<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
									{stats.responseRate}%
								</p>
								<p className="text-sm text-green-600 dark:text-green-400 mt-1">
									Excellent!
								</p>
							</div>
							<div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
								<MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Today's Lessons */}
				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="dark:text-gray-100">
									Today's Lessons
								</CardTitle>
								<CardDescription className="dark:text-gray-400">
									Your scheduled lessons for today
								</CardDescription>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => router.push("/teacher/meetings")}>
								View All
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{upcomingLessons.map((lesson) => (
							<div
								key={lesson.id}
								className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div className="flex items-center gap-4">
									<Avatar>
										<AvatarImage src={lesson.avatar || "/placeholder.svg"} />
										<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200">
											{lesson.student
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium text-gray-900 dark:text-gray-100">
											{lesson.student}
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{lesson.subject}
										</p>
										<div className="flex items-center gap-2 mt-1">
											<Badge variant="secondary" className="text-xs">
												{lesson.level}
											</Badge>
											<span className="text-xs text-gray-500 dark:text-gray-400">
												{lesson.duration}
											</span>
										</div>
									</div>
								</div>
								<div className="text-right">
									<p className="font-medium text-gray-900 dark:text-gray-100">
										{lesson.time}
									</p>
									<Button size="sm" className="mt-2">
										Start Lesson
									</Button>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Recent Messages */}
				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="dark:text-gray-100">
									Recent Messages
								</CardTitle>
								<CardDescription className="dark:text-gray-400">
									Latest messages from your students
								</CardDescription>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => router.push("/teacher/chat")}>
								View All
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{recentMessages.map((message) => (
							<div
								key={message.id}
								className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<Avatar>
									<AvatarImage src={message.avatar || "/placeholder.svg"} />
									<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200">
										{message.student
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between">
										<p className="font-medium text-gray-900 dark:text-gray-100">
											{message.student}
										</p>
										<span className="text-xs text-gray-500 dark:text-gray-400">
											{message.time}
										</span>
									</div>
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
										{message.message}
									</p>
									{message.unread && (
										<Badge variant="secondary" className="mt-2 text-xs">
											New
										</Badge>
									)}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<Card className="dark:bg-gray-800 dark:border-gray-700">
				<CardHeader>
					<CardTitle className="dark:text-gray-100">Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<Button
							className="justify-start gap-2 h-12 bg-transparent"
							variant="outline"
							onClick={() => router.push("/teacher/meetings")}>
							<Calendar className="h-5 w-5" />
							Schedule New Lesson
						</Button>
						<Button
							className="justify-start gap-2 h-12 bg-transparent"
							variant="outline"
							onClick={() => router.push("/teacher/chat")}>
							<MessageCircle className="h-5 w-5" />
							Send Message
						</Button>
						<Button
							className="justify-start gap-2 h-12 bg-transparent"
							variant="outline"
							onClick={() => router.push("/teacher/profile")}>
							<Clock className="h-5 w-5" />
							Update Availability
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
