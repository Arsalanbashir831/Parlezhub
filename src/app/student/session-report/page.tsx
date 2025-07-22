"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
	ArrowLeft,
	Download,
	Share,
	RotateCcw,
	TrendingUp,
	Clock,
	MessageCircle,
	Award,
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
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

interface ReportData {
	sessionId: string;
	language: string;
	duration: number;
	wordsSpoken: number;
	score: number;
	conversationTurns: number;
	confidence: number;
	timestamp: string;
}

export default function SessionReportPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [reportData, setReportData] = useState<ReportData | null>(null);

	useEffect(() => {
		const dataParam = searchParams.get("data");
		if (dataParam) {
			try {
				const data = JSON.parse(decodeURIComponent(dataParam));
				setReportData(data);
			} catch (error) {
				console.error("Failed to parse report data:", error);
				router.push(ROUTES.STUDENT.AI_TUTOR);
			}
		}
	}, [searchParams, router]);

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}m ${secs}s`;
	};

	const getScoreColor = (score: number) => {
		if (score >= 90) return "text-green-600 bg-green-100";
		if (score >= 80) return "text-blue-600 bg-blue-100";
		if (score >= 70) return "text-yellow-600 bg-yellow-100";
		return "text-red-600 bg-red-100";
	};

	const getScoreMessage = (score: number) => {
		if (score >= 90) return "Excellent! Outstanding performance!";
		if (score >= 80) return "Great job! You're making good progress!";
		if (score >= 70) return "Good work! Keep practicing to improve!";
		return "Nice try! Practice more to build confidence!";
	};

	const generateImprovements = (language: string, score: number) => {
		const improvements = {
			spanish: [
				"Practice rolling your R sounds more consistently",
				"Work on past tense conjugations (preterite vs imperfect)",
				"Expand vocabulary for everyday situations",
				"Focus on gender agreement with adjectives",
				"Practice using subjunctive mood in conversations",
			],
			french: [
				"Work on nasal vowel pronunciation",
				"Practice liaison between words",
				"Focus on formal vs informal register",
				"Improve use of subjunctive mood",
				"Expand vocabulary for professional contexts",
			],
			german: [
				"Practice separable verb placement",
				"Work on der/die/das article usage",
				"Focus on case endings (nominative, accusative, dative)",
				"Improve sentence structure with subordinate clauses",
				"Practice modal verb conjugations",
			],
		};

		const langImprovements =
			improvements[language as keyof typeof improvements] ||
			improvements.spanish;
		const numImprovements = score >= 85 ? 2 : score >= 70 ? 3 : 4;

		return langImprovements.slice(0, numImprovements);
	};

	const generateStrengths = (score: number) => {
		const allStrengths = [
			"Vocabulary usage",
			"Pronunciation clarity",
			"Grammar accuracy",
			"Conversation flow",
			"Listening comprehension",
			"Response timing",
			"Confidence level",
			"Cultural awareness",
		];

		const numStrengths = score >= 85 ? 4 : score >= 70 ? 3 : 2;
		return allStrengths.slice(0, numStrengths);
	};

	const handleDownloadReport = () => {
		// Mock download functionality
		console.log("Downloading report...");
	};

	const handleShareReport = () => {
		// Mock share functionality
		console.log("Sharing report...");
	};

	if (!reportData) {
		return <div>Loading...</div>;
	}

	const improvements = generateImprovements(
		reportData.language,
		reportData.score
	);
	const strengths = generateStrengths(reportData.score);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push("/dashboard/ai-tutor")}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Session Report</h1>
						<p className="text-gray-600">
							{reportData.language} practice session •{" "}
							{new Date(reportData.timestamp).toLocaleDateString()}
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					<Button variant="outline" onClick={handleShareReport}>
						<Share className="h-4 w-4 mr-2" />
						Share
					</Button>
					<Button variant="outline" onClick={handleDownloadReport}>
						<Download className="h-4 w-4 mr-2" />
						Download
					</Button>
					<Link href={ROUTES.STUDENT.AI_TUTOR}>
						<Button className="bg-primary-500 hover:bg-primary-600">
							<RotateCcw className="h-4 w-4 mr-2" />
							New Session
						</Button>
					</Link>
				</div>
			</div>

			{/* Score Overview */}
			<Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
				<CardContent className="p-8">
					<div className="text-center">
						<div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg mb-4">
							<span className="text-3xl font-bold text-primary-600">
								{reportData.score}
							</span>
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							{getScoreMessage(reportData.score)}
						</h2>
						<Badge
							className={`text-lg px-4 py-2 ${getScoreColor(
								reportData.score
							)}`}>
							Score: {reportData.score}/100
						</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Session Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Duration</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatDuration(reportData.duration)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Words Spoken</CardTitle>
						<MessageCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{reportData.wordsSpoken}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Conversation Turns
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{reportData.conversationTurns}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Confidence</CardTitle>
						<Award className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{reportData.confidence}%</div>
					</CardContent>
				</Card>
			</div>

			{/* Detailed Analysis */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Strengths */}
				<Card>
					<CardHeader>
						<CardTitle className="text-green-700">Your Strengths</CardTitle>
						<CardDescription>Areas where you performed well</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{strengths.map((strength, index) => (
							<div key={index} className="flex items-center gap-3">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-sm">{strength}</span>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Areas for Improvement */}
				<Card>
					<CardHeader>
						<CardTitle className="text-orange-700">
							Areas for Improvement
						</CardTitle>
						<CardDescription>
							Focus on these areas in your next session
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{improvements.map((improvement, index) => (
							<div key={index} className="flex items-start gap-3">
								<div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
								<span className="text-sm">{improvement}</span>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* Progress Breakdown */}
			<Card>
				<CardHeader>
					<CardTitle>Performance Breakdown</CardTitle>
					<CardDescription>
						Detailed analysis of your session performance
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div>
							<div className="flex justify-between text-sm mb-2">
								<span>Pronunciation</span>
								<span>{Math.max(70, reportData.score - 5)}%</span>
							</div>
							<Progress
								value={Math.max(70, reportData.score - 5)}
								className="h-2"
							/>
						</div>

						<div>
							<div className="flex justify-between text-sm mb-2">
								<span>Grammar</span>
								<span>{Math.max(65, reportData.score - 10)}%</span>
							</div>
							<Progress
								value={Math.max(65, reportData.score - 10)}
								className="h-2"
							/>
						</div>

						<div>
							<div className="flex justify-between text-sm mb-2">
								<span>Vocabulary</span>
								<span>{Math.min(95, reportData.score + 5)}%</span>
							</div>
							<Progress
								value={Math.min(95, reportData.score + 5)}
								className="h-2"
							/>
						</div>

						<div>
							<div className="flex justify-between text-sm mb-2">
								<span>Fluency</span>
								<span>{reportData.confidence}%</span>
							</div>
							<Progress value={reportData.confidence} className="h-2" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Next Steps */}
			<Card>
				<CardHeader>
					<CardTitle>Recommended Next Steps</CardTitle>
					<CardDescription>
						Continue your learning journey with these suggestions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
								<span className="text-xs font-semibold text-primary-600">
									1
								</span>
							</div>
							<div>
								<h4 className="font-medium">Practice Daily</h4>
								<p className="text-sm text-gray-600">
									Aim for 15-20 minutes of daily practice to maintain momentum
									and improve consistently.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
								<span className="text-xs font-semibold text-primary-600">
									2
								</span>
							</div>
							<div>
								<h4 className="font-medium">Focus on Weak Areas</h4>
								<p className="text-sm text-gray-600">
									Spend extra time on the improvement areas identified in this
									report.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
								<span className="text-xs font-semibold text-primary-600">
									3
								</span>
							</div>
							<div>
								<h4 className="font-medium">Book a Teacher Session</h4>
								<p className="text-sm text-gray-600">
									Consider booking a session with a human teacher for
									personalized feedback and guidance.
								</p>
							</div>
						</div>
					</div>

					<Separator className="my-6" />

					<div className="flex gap-3">
						<Link href={ROUTES.STUDENT.AI_TUTOR}>
							<Button className="bg-primary-500 hover:bg-primary-600">
								Start Another Session
							</Button>
						</Link>
						<Link href={ROUTES.STUDENT.TEACHERS}>
							<Button variant="outline">Find a Teacher</Button>
						</Link>
						<Link href={ROUTES.STUDENT.REPORTS}>
							<Button variant="outline">View All Reports</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
