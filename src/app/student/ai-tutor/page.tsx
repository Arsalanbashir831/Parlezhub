"use client";

import { useState } from "react";
import { Play, MessageCircle } from "lucide-react";

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
import { Progress } from "@/components/ui/progress";
import { StartSessionDialog } from "@/components/dashboard/start-session-dialog";

export default function AITutorPage() {
	const [selectedTutor, setSelectedTutor] = useState<string | null>(null);
	const [showStartDialog, setShowStartDialog] = useState(false);

	// Mock data for AI tutors
	const aiTutors = [
		{
			id: "spanish-maria",
			name: "María",
			language: "Spanish",
			level: "Beginner to Advanced",
			specialty: "Conversational Spanish",
			avatar: "/placeholder.svg?height=80&width=80",
			description:
				"Native Spanish speaker specializing in conversational practice and grammar fundamentals.",
			rating: 4.9,
			sessions: 1250,
			accent: "Mexican",
			topics: ["Daily Conversation", "Business Spanish", "Travel", "Culture"],
		},
		{
			id: "french-pierre",
			name: "Pierre",
			language: "French",
			level: "Intermediate to Advanced",
			specialty: "Business French",
			avatar: "/placeholder.svg?height=80&width=80",
			description:
				"Expert in business French and formal communication with Parisian accent.",
			rating: 4.8,
			sessions: 980,
			accent: "Parisian",
			topics: [
				"Business French",
				"Formal Writing",
				"Pronunciation",
				"Literature",
			],
		},
		{
			id: "german-hans",
			name: "Hans",
			language: "German",
			level: "Beginner to Intermediate",
			specialty: "Grammar & Structure",
			avatar: "/placeholder.svg?height=80&width=80",
			description:
				"Systematic approach to German grammar with focus on practical application.",
			rating: 4.7,
			sessions: 750,
			accent: "Standard German",
			topics: ["Grammar", "Pronunciation", "Daily Life", "Culture"],
		},
		{
			id: "italian-sofia",
			name: "Sofia",
			language: "Italian",
			level: "All Levels",
			specialty: "Cultural Immersion",
			avatar: "/placeholder.svg?height=80&width=80",
			description:
				"Learn Italian through cultural context and real-life scenarios.",
			rating: 4.9,
			sessions: 1100,
			accent: "Roman",
			topics: ["Culture", "Food & Cooking", "Travel", "Art & History"],
		},
		{
			id: "japanese-yuki",
			name: "Yuki",
			language: "Japanese",
			level: "Beginner to Advanced",
			specialty: "Comprehensive Japanese",
			avatar: "/placeholder.svg?height=80&width=80",
			description:
				"Complete Japanese learning from Hiragana to advanced conversation.",
			rating: 4.8,
			sessions: 890,
			accent: "Tokyo",
			topics: [
				"Hiragana/Katakana",
				"Kanji",
				"Conversation",
				"Business Japanese",
			],
		},
		{
			id: "mandarin-li",
			name: "Li Wei",
			language: "Mandarin",
			level: "All Levels",
			specialty: "Tones & Pronunciation",
			avatar: "/placeholder.svg?height=80&width=80",
			description:
				"Master Mandarin tones and pronunciation with systematic practice.",
			rating: 4.9,
			sessions: 1350,
			accent: "Beijing",
			topics: ["Tones", "Pronunciation", "Characters", "Business Chinese"],
		},
	];

	const recentSessions = [
		{
			id: 1,
			tutor: "María",
			language: "Spanish",
			date: "2024-01-15",
			duration: "25 min",
			topic: "Daily Conversation",
			progress: 85,
			status: "completed",
		},
		{
			id: 2,
			tutor: "Pierre",
			language: "French",
			date: "2024-01-14",
			duration: "30 min",
			topic: "Business French",
			progress: 92,
			status: "completed",
		},
		{
			id: 3,
			tutor: "Hans",
			language: "German",
			date: "2024-01-13",
			duration: "20 min",
			topic: "Grammar Practice",
			progress: 78,
			status: "completed",
		},
	];

	const handleStartSession = (tutorId: string) => {
		setSelectedTutor(tutorId);
		setShowStartDialog(true);
	};

	return (
		<>
			<div className="space-y-6 sm:space-y-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
							AI Language Tutors
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
							Practice with AI tutors available 24/7 in multiple languages
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge
							variant="secondary"
							className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
							6 Languages Available
						</Badge>
					</div>
				</div>

				{/* Recent Sessions */}
				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardHeader className="pb-4">
						<CardTitle className="text-lg sm:text-xl dark:text-gray-100">
							Recent Sessions
						</CardTitle>
						<CardDescription className="dark:text-gray-400">
							Your latest AI tutor conversations
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentSessions.map((session) => (
								<div
									key={session.id}
									className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg gap-4">
									<div className="flex items-center gap-4">
										<div className="h-10 w-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
											<MessageCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
										</div>
										<div>
											<p className="font-medium text-gray-900 dark:text-gray-100">
												{session.tutor} - {session.language}
											</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{session.topic}
											</p>
											<div className="flex items-center gap-4 mt-1">
												<span className="text-xs text-gray-500 dark:text-gray-400">
													{session.date}
												</span>
												<span className="text-xs text-gray-500 dark:text-gray-400">
													{session.duration}
												</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<div className="text-right min-w-0 flex-1 sm:flex-none">
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{session.progress}% Complete
											</p>
											<Progress
												value={session.progress}
												className="w-full sm:w-20 h-2 mt-1"
											/>
										</div>
										<Button
											size="sm"
											variant="outline"
											className="shrink-0 bg-transparent">
											Review
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* AI Tutors Grid */}
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
						Choose Your AI Tutor
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
						{aiTutors.map((tutor) => (
							<Card
								key={tutor.id}
								className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
								<CardHeader className="pb-4">
									<div className="flex items-center gap-4">
										<Avatar className="h-12 w-12 sm:h-16 sm:w-16">
											<AvatarImage src={tutor.avatar || "/placeholder.svg"} />
											<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-lg sm:text-xl">
												{tutor.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
												{tutor.name}
											</h3>
											<p className="text-primary-600 dark:text-primary-400 font-medium">
												{tutor.language}
											</p>
											<div className="flex items-center gap-2 mt-1">
												<div className="flex items-center">
													{[...Array(5)].map((_, i) => (
														<div
															key={i}
															className={`h-3 w-3 rounded-full ${
																i < Math.floor(tutor.rating)
																	? "bg-yellow-400"
																	: "bg-gray-300 dark:bg-gray-600"
															}`}
														/>
													))}
												</div>
												<span className="text-sm text-gray-600 dark:text-gray-400">
													{tutor.rating} ({tutor.sessions})
												</span>
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
											{tutor.description}
										</p>
										<div className="space-y-2">
											<div className="flex flex-wrap gap-1">
												<Badge variant="secondary" className="text-xs">
													{tutor.level}
												</Badge>
												<Badge variant="outline" className="text-xs">
													{tutor.accent}
												</Badge>
											</div>
											<div className="flex flex-wrap gap-1">
												{tutor.topics.slice(0, 3).map((topic) => (
													<Badge
														key={topic}
														variant="outline"
														className="text-xs">
														{topic}
													</Badge>
												))}
												{tutor.topics.length > 3 && (
													<Badge variant="outline" className="text-xs">
														+{tutor.topics.length - 3} more
													</Badge>
												)}
											</div>
										</div>
									</div>
									<div className="flex flex-col sm:flex-row gap-2">
										<Button
											className="flex-1"
											onClick={() => handleStartSession(tutor.id)}>
											<Play className="h-4 w-4 mr-2" />
											Start Session
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="sm:w-auto bg-transparent">
											<MessageCircle className="h-4 w-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardContent className="p-4 sm:p-6">
							<div className="text-center">
								<p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
									24
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Total Sessions
								</p>
							</div>
						</CardContent>
					</Card>
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardContent className="p-4 sm:p-6">
							<div className="text-center">
								<p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
									12h
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Practice Time
								</p>
							</div>
						</CardContent>
					</Card>
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardContent className="p-4 sm:p-6">
							<div className="text-center">
								<p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
									6
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Languages
								</p>
							</div>
						</CardContent>
					</Card>
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardContent className="p-4 sm:p-6">
							<div className="text-center">
								<p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
									85%
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Avg Progress
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<StartSessionDialog
				open={showStartDialog}
				onOpenChange={setShowStartDialog}
				tutorId={selectedTutor}
			/>
		</>
	);
}
