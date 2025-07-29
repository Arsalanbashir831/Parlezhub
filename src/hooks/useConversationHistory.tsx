"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConversationData } from "../components/history/conversation-card";
import { ROUTES } from "@/constants/routes";

// Mock conversations data
const mockConversations: ConversationData[] = [
	{
		id: "1",
		language: "Spanish",
		topic: "Restaurant Conversation",
		date: "2024-01-15T10:30:00Z",
		duration: 15,
		score: 85,
		wordsSpoken: 245,
		status: "completed",
		hasTranscript: true,
	},
	{
		id: "2",
		language: "French",
		topic: "Travel Planning",
		date: "2024-01-14T14:15:00Z",
		duration: 20,
		score: 92,
		wordsSpoken: 312,
		status: "completed",
		hasTranscript: true,
	},
	{
		id: "3",
		language: "Spanish",
		topic: "Daily Routine",
		date: "2024-01-13T09:45:00Z",
		duration: 12,
		score: 78,
		wordsSpoken: 189,
		status: "completed",
		hasTranscript: true,
	},
	{
		id: "4",
		language: "German",
		topic: "Job Interview Practice",
		date: "2024-01-12T16:20:00Z",
		duration: 25,
		score: 88,
		wordsSpoken: 356,
		status: "completed",
		hasTranscript: true,
	},
	{
		id: "5",
		language: "French",
		topic: "Shopping Experience",
		date: "2024-01-11T11:10:00Z",
		duration: 18,
		score: 81,
		wordsSpoken: 267,
		status: "completed",
		hasTranscript: true,
	},
];

export const useConversationHistory = () => {
	const router = useRouter();
	const [conversations] = useState<ConversationData[]>(mockConversations);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLanguage, setSelectedLanguage] = useState("all");
	const [sortBy, setSortBy] = useState("date");
	const [isLoading, setIsLoading] = useState(false);

	// Get available languages from conversations
	const availableLanguages = useMemo(() => {
		const languages = new Set(conversations.map((conv) => conv.language));
		return Array.from(languages).sort();
	}, [conversations]);

	// Filter and sort conversations
	const filteredConversations = useMemo(() => {
		return conversations
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
	}, [conversations, searchQuery, selectedLanguage, sortBy]);

	// Calculate total stats
	const totalStats = useMemo(
		() => ({
			totalConversations: conversations.length,
			totalMinutes: conversations.reduce((sum, conv) => sum + conv.duration, 0),
			averageScore: Math.round(
				conversations.reduce((sum, conv) => sum + conv.score, 0) /
					conversations.length
			),
			totalWords: conversations.reduce(
				(sum, conv) => sum + conv.wordsSpoken,
				0
			),
		}),
		[conversations]
	);

	// Handlers
	const handleStartNewConversation = useCallback(() => {
		router.push(ROUTES.STUDENT.AI_TUTOR);
	}, [router]);

	const handleLoadMore = useCallback(() => {
		setIsLoading(true);
		// Simulate loading more conversations
		setTimeout(() => {
			setIsLoading(false);
		}, 1000);
	}, []);

	const handleSearchChange = useCallback((value: string) => {
		setSearchQuery(value);
	}, []);

	const handleLanguageChange = useCallback((value: string) => {
		setSelectedLanguage(value);
	}, []);

	const handleSortChange = useCallback((value: string) => {
		setSortBy(value);
	}, []);

	return {
		// Data
		conversations: filteredConversations,
		totalStats,
		availableLanguages,
		isLoading,

		// Filter states
		searchQuery,
		selectedLanguage,
		sortBy,

		// Handlers
		handleStartNewConversation,
		handleLoadMore,
		handleSearchChange,
		handleLanguageChange,
		handleSortChange,
	};
};
