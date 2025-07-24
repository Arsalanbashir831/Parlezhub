"use client";

import { useState, useEffect } from "react";
import {
	DashboardStats,
	RecentConversation,
	UpcomingMeeting,
} from "@/types/dashboard";

// Mock data - in real app this would come from API
const mockStats: DashboardStats = {
	totalConversations: 24,
	totalMinutes: 180,
	upcomingMeetings: 2,
	currentStreak: 7,
	languagesLearning: [
		{ name: "Spanish", level: "Intermediate", progress: 75 },
		{ name: "French", level: "Beginner", progress: 45 },
	],
};

const recentConversations: RecentConversation[] = [
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

const upcomingMeetings: UpcomingMeeting[] = [
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

export function useDashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [conversations, setConversations] = useState<RecentConversation[]>([]);
	const [meetings, setMeetings] = useState<UpcomingMeeting[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Simulate API call
		const loadDashboardData = async () => {
			setIsLoading(true);

			// Simulate network delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			setStats(mockStats);
			setConversations(recentConversations);
			setMeetings(upcomingMeetings);
			setIsLoading(false);
		};

		loadDashboardData();
	}, []);

	return {
		stats,
		conversations,
		meetings,
		isLoading,
	};
}
