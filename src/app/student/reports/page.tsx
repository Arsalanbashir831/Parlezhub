"use client";

import { useState } from "react";
import {
	TrendingUp,
	Clock,
	Target,
	Award,
	BarChart3,
	Download,
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
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
	const [selectedPeriod, setSelectedPeriod] = useState("month");
	const [selectedLanguage, setSelectedLanguage] = useState("all");

	// Mock data
	const overallStats = {
		totalSessions: 45,
		totalHours: 28.5,
		averageScore: 87,
		streak: 12,
		improvement: 15,
	};

	const languageProgress = [
		{
			language: "Spanish",
			level: "Intermediate",
			progress: 75,
			sessions: 18,
			hours: 12.5,
			lastSession: "2 days ago",
			improvement: "+12%",
			color: "bg-red-500",
		},
		{
			language: "French",
			level: "Beginner",
			progress: 45,
			sessions: 12,
			hours: 8.0,
			lastSession: "1 day ago",
			improvement: "+8%",
			color: "bg-blue-500",
		},
		{
			language: "German",
			level: "Beginner",
			progress: 30,
			sessions: 8,
			hours: 5.5,
			lastSession: "3 days ago",
			improvement: "+5%",
			color: "bg-yellow-500",
		},
		{
			language: "Italian",
			level: "Beginner",
			progress: 20,
			sessions: 7,
			hours: 2.5,
			lastSession: "1 week ago",
			improvement: "+3%",
			color: "bg-green-500",
		},
	];

	const weeklyActivity = [
		{ day: "Mon", sessions: 2, hours: 1.5 },
		{ day: "Tue", sessions: 1, hours: 0.5 },
		{ day: "Wed", sessions: 3, hours: 2.0 },
		{ day: "Thu", sessions: 2, hours: 1.0 },
		{ day: "Fri", sessions: 1, hours: 0.5 },
		{ day: "Sat", sessions: 0, hours: 0 },
		{ day: "Sun", sessions: 2, hours: 1.5 },
	];

	const achievements = [
		{
			id: 1,
			title: "First Conversation",
			description: "Completed your first AI conversation",
			date: "2024-01-10",
			icon: "🎯",
			earned: true,
		},
		{
			id: 2,
			title: "Week Warrior",
			description: "Practiced 7 days in a row",
			date: "2024-01-15",
			icon: "🔥",
			earned: true,
		},
		{
			id: 3,
			title: "Polyglot",
			description: "Started learning 3 languages",
			date: "2024-01-18",
			icon: "🌍",
			earned: true,
		},
		{
			id: 4,
			title: "Speed Learner",
			description: "Complete 50 sessions",
			date: null,
			icon: "⚡",
			earned: false,
		},
	];

	const recentSessions = [
		{
			id: 1,
			type: "AI Tutor",
			language: "Spanish",
			tutor: "María",
			date: "2024-01-20",
			duration: "25 min",
			score: 92,
			topic: "Daily Conversation",
		},
		{
			id: 2,
			type: "Human Teacher",
			language: "French",
			tutor: "Sophie Laurent",
			date: "2024-01-19",
			duration: "60 min",
			score: 88,
			topic: "Business French",
		},
		{
			id: 3,
			type: "AI Tutor",
			language: "German",
			tutor: "Hans",
			date: "2024-01-18",
			duration: "20 min",
			score: 85,
			topic: "Grammar Practice",
		},
	];

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
						Learning Reports
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
						Track your progress and analyze your learning journey
					</p>
				</div>
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
					<Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
						<SelectTrigger className="w-full sm:w-[140px]">
							<SelectValue placeholder="Select period" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="week">This Week</SelectItem>
							<SelectItem value="month">This Month</SelectItem>
							<SelectItem value="quarter">This Quarter</SelectItem>
							<SelectItem value="year">This Year</SelectItem>
						</SelectContent>
					</Select>
					<Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
						<SelectTrigger className="w-full sm:w-[140px]">
							<SelectValue placeholder="All Languages" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Languages</SelectItem>
							<SelectItem value="spanish">Spanish</SelectItem>
							<SelectItem value="french">French</SelectItem>
							<SelectItem value="german">German</SelectItem>
							<SelectItem value="italian">Italian</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline" size="sm" className="gap-2 bg-transparent">
						<Download className="h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			{/* Overall Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardContent className="p-4 sm:p-6">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
								<BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
									{overallStats.totalSessions}
								</p>
								<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
									Total Sessions
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardContent className="p-4 sm:p-6">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
								<Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
									{overallStats.totalHours}h
								</p>
								<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
									Study Time
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardContent className="p-4 sm:p-6">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
								<Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
									{overallStats.averageScore}%
								</p>
								<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
									Avg Score
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardContent className="p-4 sm:p-6">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
								<Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
							</div>
							<div>
								<p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
									{overallStats.streak}
								</p>
								<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
									Day Streak
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardContent className="p-4 sm:p-6">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
								<TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
							</div>
							<div>
								<p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
									+{overallStats.improvement}%
								</p>
								<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
									Improvement
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
				{/* Left Column - Language Progress & Activity */}
				<div className="lg:col-span-2 space-y-6 sm:space-y-8">
					{/* Language Progress */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle className="dark:text-gray-100">
								Language Progress
							</CardTitle>
							<CardDescription className="dark:text-gray-400">
								Your progress in each language
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{languageProgress.map((lang) => (
								<div key={lang.language} className="space-y-3">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
										<div className="flex items-center gap-3">
											<div className={`h-3 w-3 rounded-full ${lang.color}`} />
											<div>
												<p className="font-medium text-gray-900 dark:text-gray-100">
													{lang.language}
												</p>
												<p className="text-sm text-gray-600 dark:text-gray-400">
													{lang.level}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
											<span>{lang.sessions} sessions</span>
											<span>{lang.hours}h</span>
											<Badge
												variant="secondary"
												className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
												{lang.improvement}
											</Badge>
										</div>
									</div>
									<div className="space-y-2">
										<div className="flex justify-between text-sm">
											<span className="text-gray-600 dark:text-gray-400">
												Progress
											</span>
											<span className="font-medium text-gray-900 dark:text-gray-100">
												{lang.progress}%
											</span>
										</div>
										<Progress value={lang.progress} className="h-2" />
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Weekly Activity */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle className="dark:text-gray-100">
								Weekly Activity
							</CardTitle>
							<CardDescription className="dark:text-gray-400">
								Your learning activity this week
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-7 gap-2 sm:gap-4">
								{weeklyActivity.map((day) => (
									<div key={day.day} className="text-center">
										<p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
											{day.day}
										</p>
										<div className="space-y-1">
											<div
												className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2 sm:p-3"
												style={{
													height: `${Math.max(day.sessions * 20, 20)}px`,
												}}>
												<div className="text-xs font-bold text-primary-700 dark:text-primary-300">
													{day.sessions}
												</div>
											</div>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{day.hours}h
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Achievements & Recent Sessions */}
				<div className="space-y-6 sm:space-y-8">
					{/* Achievements */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle className="dark:text-gray-100">Achievements</CardTitle>
							<CardDescription className="dark:text-gray-400">
								Your learning milestones
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{achievements.map((achievement) => (
								<div
									key={achievement.id}
									className={`flex items-center gap-3 p-3 rounded-lg ${
										achievement.earned
											? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
											: "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
									}`}>
									<div className="text-2xl">{achievement.icon}</div>
									<div className="flex-1 min-w-0">
										<p
											className={`font-medium ${
												achievement.earned
													? "text-green-900 dark:text-green-100"
													: "text-gray-500 dark:text-gray-400"
											}`}>
											{achievement.title}
										</p>
										<p
											className={`text-sm ${
												achievement.earned
													? "text-green-700 dark:text-green-300"
													: "text-gray-400 dark:text-gray-500"
											}`}>
											{achievement.description}
										</p>
										{achievement.date && (
											<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
												{achievement.date}
											</p>
										)}
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Recent Sessions */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle className="dark:text-gray-100">
								Recent Sessions
							</CardTitle>
							<CardDescription className="dark:text-gray-400">
								Your latest learning sessions
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{recentSessions.map((session) => (
								<div
									key={session.id}
									className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<Badge
												variant={
													session.type === "AI Tutor" ? "default" : "secondary"
												}
												className="text-xs">
												{session.type}
											</Badge>
											<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{session.language}
											</span>
										</div>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{session.tutor}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{session.topic}
										</p>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-xs text-gray-500 dark:text-gray-400">
												{session.date}
											</span>
											<span className="text-xs text-gray-500 dark:text-gray-400">
												{session.duration}
											</span>
										</div>
									</div>
									<div className="text-right">
										<div
											className={`text-lg font-bold ${
												session.score >= 90
													? "text-green-600 dark:text-green-400"
													: session.score >= 80
													? "text-blue-600 dark:text-blue-400"
													: "text-orange-600 dark:text-orange-400"
											}`}>
											{session.score}%
										</div>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
