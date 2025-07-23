"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Play, FileText, Calendar, Clock, Award } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

// Mock conversations data
const mockConversations = [
	{
		id: "1",
		avatarName: "Alex",
		language: "Spanish",
		topic: "Restaurant Conversation",
		date: "2024-01-15T10:30:00Z",
		duration: 15,
		score: 85,
		wordsSpoken: 245,
		status: "completed",
		hasReport: true,
	},
	{
		id: "2",
		avatarName: "Alex",
		language: "French",
		topic: "Travel Planning",
		date: "2024-01-14T14:15:00Z",
		duration: 20,
		score: 92,
		wordsSpoken: 312,
		status: "completed",
		hasReport: true,
	},
	{
		id: "3",
		avatarName: "Alex",
		language: "Spanish",
		topic: "Daily Routine",
		date: "2024-01-13T09:45:00Z",
		duration: 12,
		score: 78,
		wordsSpoken: 189,
		status: "completed",
		hasReport: true,
	},
	{
		id: "4",
		avatarName: "Alex",
		language: "German",
		topic: "Job Interview Practice",
		date: "2024-01-12T16:20:00Z",
		duration: 25,
		score: 88,
		wordsSpoken: 356,
		status: "completed",
		hasReport: true,
	},
	{
		id: "5",
		avatarName: "Alex",
		language: "French",
		topic: "Shopping Experience",
		date: "2024-01-11T11:10:00Z",
		duration: 18,
		score: 81,
		wordsSpoken: 267,
		status: "completed",
		hasReport: true,
	},
];

export default function ConversationsPage() {
	const [conversations, setConversations] = useState(mockConversations);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLanguage, setSelectedLanguage] = useState("all");
	const [sortBy, setSortBy] = useState("date");
	const router = useRouter();

	const handleViewReport = (conversationId: string) => {
		router.push(ROUTES.STUDENT.REPORTS + "?conversation=" + conversationId);
	};

	const handleContinueConversation = (conversation: any) => {
		const sessionData = {
			avatarId: "1",
			language: conversation.language.toLowerCase(),
			sessionType: "conversation",
			topic: conversation.topic,
			timestamp: new Date().toISOString(),
		};
		router.push(
			ROUTES.STUDENT.AI_TUTOR +
				"?session=" +
				encodeURIComponent(JSON.stringify(sessionData))
		);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString([], {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getScoreColor = (score: number) => {
		if (score >= 90) return "text-green-600 bg-green-100";
		if (score >= 80) return "text-blue-600 bg-blue-100";
		if (score >= 70) return "text-yellow-600 bg-yellow-100";
		return "text-red-600 bg-red-100";
	};

	const filteredConversations = conversations
		.filter((conv) => {
			const matchesSearch =
				conv.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
				conv.language.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesLanguage =
				selectedLanguage === "all" || conv.language === selectedLanguage;
			return matchesSearch && matchesLanguage;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "date":
					return new Date(b.date).getTime() - new Date(a.date).getTime();
				case "score":
					return b.score - a.score;
				case "duration":
					return b.duration - a.duration;
				default:
					return 0;
			}
		});

	const totalStats = {
		totalConversations: conversations.length,
		totalMinutes: conversations.reduce((sum, conv) => sum + conv.duration, 0),
		averageScore: Math.round(
			conversations.reduce((sum, conv) => sum + conv.score, 0) /
				conversations.length
		),
		totalWords: conversations.reduce((sum, conv) => sum + conv.wordsSpoken, 0),
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-gray-900">All Conversations</h1>
				<p className="text-gray-600">
					Review your AI conversation history and progress
				</p>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Conversations
						</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalStats.totalConversations}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Practice Time
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalStats.totalMinutes}m</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Words Spoken</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalStats.totalWords.toLocaleString()}
						</div>
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
								placeholder="Search conversations..."
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
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="date">Most Recent</SelectItem>
								<SelectItem value="score">Highest Score</SelectItem>
								<SelectItem value="duration">Longest Duration</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Conversations List */}
			<div className="space-y-4">
				{filteredConversations.map((conversation) => (
					<Card
						key={conversation.id}
						className="hover:shadow-md transition-shadow">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<Avatar className="h-12 w-12">
										<AvatarImage src="/placeholder.svg" />
										<AvatarFallback className="bg-primary-100 text-primary-700">
											{conversation.avatarName.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div>
										<h3 className="font-semibold text-lg">
											{conversation.topic}
										</h3>
										<p className="text-gray-600">
											{conversation.language} with {conversation.avatarName} •{" "}
											{formatDate(conversation.date)}
										</p>
										<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
											<span className="flex items-center gap-1">
												<Clock className="h-4 w-4" />
												{conversation.duration} min
											</span>
											<span>{conversation.wordsSpoken} words</span>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<Badge
										className={cn(
											"font-semibold",
											getScoreColor(conversation.score)
										)}>
										{conversation.score}%
									</Badge>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleViewReport(conversation.id)}
											disabled={!conversation.hasReport}>
											<FileText className="h-4 w-4 mr-1" />
											Report
										</Button>
										<Button
											size="sm"
											className="bg-primary-500 hover:bg-primary-600"
											onClick={() => handleContinueConversation(conversation)}>
											<Play className="h-4 w-4 mr-1" />
											Continue
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* No Results */}
			{filteredConversations.length === 0 && (
				<Card className="text-center py-12">
					<CardContent>
						<div className="flex flex-col items-center gap-4">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
								<Search className="h-8 w-8 text-gray-400" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									No conversations found
								</h3>
								<p className="text-gray-600 mt-1">
									Try adjusting your search criteria or start a new conversation
								</p>
							</div>
							<Button
								className="bg-primary-500 hover:bg-primary-600"
								onClick={() => router.push(ROUTES.STUDENT.AI_TUTOR)}>
								Start New Conversation
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Load More */}
			{filteredConversations.length > 0 && (
				<div className="text-center">
					<Button variant="outline">Load More Conversations</Button>
				</div>
			)}
		</div>
	);
}
