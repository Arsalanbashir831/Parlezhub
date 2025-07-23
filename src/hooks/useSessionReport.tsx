"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

interface SessionData {
	sessionId: string;
	language: string;
	topic: string;
	date: string;
	duration: number;
	wordsSpoken: number;
	score: number;
	conversationTurns: number;
	confidence: number;
	accuracy: number;
	fluency: number;
	pronunciation: number;
	status: string;
}

interface ConversationMessage {
	id: string;
	type: "user" | "ai";
	content: string;
	timestamp: string;
	correction?: string;
	feedback?: string;
}

interface FeedbackItem {
	id: string;
	type: "strength" | "improvement" | "suggestion";
	category: string;
	message: string;
	example?: string;
}

interface Recommendation {
	id: string;
	title: string;
	description: string;
	type: "lesson" | "exercise" | "topic";
	difficulty: "beginner" | "intermediate" | "advanced";
	estimatedTime: number;
}

// Mock data generator
const generateMockReportData = (
	conversationId: string
): {
	sessionData: SessionData;
	messages: ConversationMessage[];
	feedback: FeedbackItem[];
	recommendations: Recommendation[];
} => {
	const sessionData: SessionData = {
		sessionId: conversationId,
		language: "Spanish",
		topic: "Restaurant Conversation",
		date: new Date().toISOString(),
		duration: 15.5,
		wordsSpoken: 245,
		score: 85,
		conversationTurns: 12,
		confidence: 82,
		accuracy: 88,
		fluency: 80,
		pronunciation: 87,
		status: "completed",
	};

	const messages: ConversationMessage[] = [
		{
			id: "1",
			type: "ai",
			content: "¡Hola! Bienvenido al restaurante. ¿Qué le gustaría ordenar?",
			timestamp: new Date(Date.now() - 900000).toISOString(),
		},
		{
			id: "2",
			type: "user",
			content: "Hola, me gustaría una pizza margarita, por favor.",
			timestamp: new Date(Date.now() - 870000).toISOString(),
			feedback: "Great use of polite expressions!",
		},
		{
			id: "3",
			type: "ai",
			content:
				"Excelente elección. ¿Qué tamaño prefiere? ¿Grande, mediana o pequeña?",
			timestamp: new Date(Date.now() - 840000).toISOString(),
		},
		{
			id: "4",
			type: "user",
			content: "Una pizza grande, y también quiero una coca cola.",
			timestamp: new Date(Date.now() - 810000).toISOString(),
			correction: "Una pizza grande, y también quiero una Coca-Cola.",
		},
	];

	const feedback: FeedbackItem[] = [
		{
			id: "1",
			type: "strength",
			category: "Vocabulary",
			message:
				"You used appropriate restaurant vocabulary and showed good understanding of the menu context.",
			example: "Using 'me gustaría' instead of 'quiero' shows politeness.",
		},
		{
			id: "2",
			type: "strength",
			category: "Grammar",
			message: "Excellent use of formal expressions and sentence structure.",
		},
		{
			id: "3",
			type: "improvement",
			category: "Pronunciation",
			message:
				"Work on the 'rr' sound in 'margarita'. Practice rolling your r's more distinctly.",
			example: "Try saying 'ma-rga-ri-ta' with emphasis on the double r.",
		},
		{
			id: "4",
			type: "suggestion",
			category: "Fluency",
			message:
				"Try to speak with fewer pauses. Practice common restaurant phrases to improve flow.",
			example: "Memorize: '¿Podrían traerme...?' for making requests.",
		},
	];

	const recommendations: Recommendation[] = [
		{
			id: "1",
			title: "Restaurant Vocabulary Expansion",
			description:
				"Learn more food and drink terms to expand your restaurant conversations.",
			type: "lesson",
			difficulty: "intermediate",
			estimatedTime: 20,
		},
		{
			id: "2",
			title: "Pronunciation Practice: RR Sound",
			description: "Focused exercises on rolling your r's in Spanish words.",
			type: "exercise",
			difficulty: "beginner",
			estimatedTime: 15,
		},
		{
			id: "3",
			title: "Ordering Food Conversations",
			description:
				"Practice more complex ordering scenarios and food preferences.",
			type: "topic",
			difficulty: "intermediate",
			estimatedTime: 25,
		},
	];

	return { sessionData, messages, feedback, recommendations };
};

export const useSessionReport = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const conversationId = searchParams.get("conversation");

	const [reportData, setReportData] = useState<{
		sessionData: SessionData;
		messages: ConversationMessage[];
		feedback: FeedbackItem[];
		recommendations: Recommendation[];
	} | null>(null);

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (conversationId) {
			// Simulate API call delay
			setTimeout(() => {
				const data = generateMockReportData(conversationId);
				setReportData(data);
				setIsLoading(false);
			}, 1000);
		} else {
			// Redirect if no conversation ID
			router.push(ROUTES.STUDENT.HISTORY);
		}
	}, [conversationId, router]);

	const handleDownload = useCallback(() => {
		// Mock download functionality
		const element = document.createElement("a");
		const file = new Blob([JSON.stringify(reportData, null, 2)], {
			type: "application/json",
		});
		element.href = URL.createObjectURL(file);
		element.download = `session-report-${conversationId}.json`;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}, [reportData, conversationId]);

	const handleShare = useCallback(() => {
		if (navigator.share) {
			navigator.share({
				title: "My Language Learning Session Report",
				text: `I just completed a ${reportData?.sessionData.language} conversation session with a score of ${reportData?.sessionData.score}%!`,
				url: window.location.href,
			});
		} else {
			// Fallback: copy to clipboard
			navigator.clipboard.writeText(window.location.href);
			alert("Report link copied to clipboard!");
		}
	}, [reportData]);

	const handleRetry = useCallback(() => {
		router.push(ROUTES.STUDENT.AI_TUTOR);
	}, [router]);

	const handleStartRecommendation = useCallback(
		(recommendationId: string) => {
			// Mock navigation to recommendation
			console.log("Starting recommendation:", recommendationId);
			router.push(ROUTES.STUDENT.AI_TUTOR);
		},
		[router]
	);

	return {
		reportData,
		isLoading,
		conversationId,
		handleDownload,
		handleShare,
		handleRetry,
		handleStartRecommendation,
	};
};
