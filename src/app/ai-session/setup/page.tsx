"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	ChevronLeft,
	ChevronRight,
	Globe,
	User,
	MessageCircle,
	Play,
	Check,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AiSessionHeader from "@/components/ai-session/ai-session-header";
import { ROUTES } from "@/constants/routes";

interface SessionConfig {
	language: string;
	gender: "male" | "female" | "neutral";
	accent: string;
	context: string;
	topic: string;
	level: string;
}

const languages = [
	{ value: "spanish", label: "Spanish", flag: "🇪🇸" },
	{ value: "french", label: "French", flag: "🇫🇷" },
	{ value: "german", label: "German", flag: "🇩🇪" },
	{ value: "italian", label: "Italian", flag: "🇮🇹" },
	{ value: "japanese", label: "Japanese", flag: "🇯🇵" },
	{ value: "mandarin", label: "Mandarin", flag: "🇨🇳" },
];

const accents = {
	spanish: ["Neutral", "Mexican", "Argentinian", "Spanish"],
	french: ["Neutral", "Parisian", "Canadian", "Belgian"],
	german: ["Neutral", "Standard", "Austrian", "Swiss"],
	italian: ["Neutral", "Roman", "Milanese", "Neapolitan"],
	japanese: ["Neutral", "Tokyo", "Osaka", "Kyoto"],
	mandarin: ["Neutral", "Beijing", "Taiwanese", "Singaporean"],
};

const topics = [
	"Daily Conversation",
	"Business Communication",
	"Travel & Tourism",
	"Food & Culture",
	"Academic Discussion",
	"Job Interview Prep",
	"Shopping & Services",
	"Health & Wellness",
];

const levels = [
	{ value: "beginner", label: "Beginner", description: "Just starting out" },
	{
		value: "intermediate",
		label: "Intermediate",
		description: "Some experience",
	},
	{ value: "advanced", label: "Advanced", description: "Fluent conversation" },
];

export default function SessionSetupPage() {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(0);
	const [config, setConfig] = useState<SessionConfig>({
		language: "spanish",
		gender: "neutral",
		accent: "Neutral",
		context:
			"You are a friendly and patient language tutor who helps students practice conversation skills.",
		topic: "Daily Conversation",
		level: "intermediate",
	});

	const steps = [
		{
			title: "Choose Language",
			description: "Select the language you want to practice",
			icon: Globe,
		},
		{
			title: "AI Tutor Settings",
			description: "Customize your AI tutor's voice and personality",
			icon: User,
		},
		{
			title: "Session Details",
			description: "Set your conversation topic and level",
			icon: MessageCircle,
		},
		{
			title: "Ready to Start",
			description: "Review your settings and begin",
			icon: Play,
		},
	];

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleStartSession = () => {
		// Save config to localStorage or pass as query params
		localStorage.setItem("sessionConfig", JSON.stringify(config));
		router.push(ROUTES.AI_SESSION.START);
	};

	const updateConfig = (key: keyof SessionConfig, value: string) => {
		setConfig((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return (
					<div className="space-y-6">
						<div className="text-center">
							<h2 className="text-2xl font-bold mb-2">Choose Your Language</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Which language would you like to practice today?
							</p>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{languages.map((language) => (
								<Card
									key={language.value}
									className={`cursor-pointer transition-all hover:shadow-md ${
										config.language === language.value
											? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
											: ""
									}`}
									onClick={() => updateConfig("language", language.value)}>
									<CardContent className="p-6 text-center">
										<div className="text-4xl mb-2">{language.flag}</div>
										<h3 className="font-semibold">{language.label}</h3>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				);

			case 1:
				return (
					<div className="space-y-6">
						<div className="text-center">
							<h2 className="text-2xl font-bold mb-2">AI Tutor Settings</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Customize your AI tutor's voice and personality
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Gender Selection */}
							<div className="space-y-4">
								<Label className="text-base font-semibold">Voice Gender</Label>
								<RadioGroup
									value={config.gender}
									onValueChange={(value) => updateConfig("gender", value)}
									className="grid grid-cols-3 gap-4">
									{["male", "female", "neutral"].map((gender) => (
										<div key={gender} className="flex items-center space-x-2">
											<RadioGroupItem value={gender} id={gender} />
											<Label
												htmlFor={gender}
												className="capitalize cursor-pointer">
												{gender}
											</Label>
										</div>
									))}
								</RadioGroup>
							</div>

							{/* Accent Selection */}
							<div className="space-y-4">
								<Label className="text-base font-semibold">Accent</Label>
								<Select
									value={config.accent}
									onValueChange={(value) => updateConfig("accent", value)}>
									<SelectTrigger>
										<SelectValue placeholder="Select accent" />
									</SelectTrigger>
									<SelectContent>
										{accents[config.language as keyof typeof accents]?.map(
											(accent) => (
												<SelectItem key={accent} value={accent}>
													{accent}
												</SelectItem>
											)
										)}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Context */}
						<div className="space-y-2">
							<Label className="text-base font-semibold">
								Tutor Personality & Context
							</Label>
							<Textarea
								value={config.context}
								onChange={(e) => updateConfig("context", e.target.value)}
								placeholder="Describe how you want your AI tutor to behave..."
								rows={4}
							/>
							<p className="text-sm text-gray-500">
								This helps the AI understand your preferred teaching style
							</p>
						</div>
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						<div className="text-center">
							<h2 className="text-2xl font-bold mb-2">Session Details</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Set your conversation topic and proficiency level
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Topic Selection */}
							<div className="space-y-4">
								<Label className="text-base font-semibold">
									Conversation Topic
								</Label>
								<div className="grid grid-cols-1 gap-2">
									{topics.map((topic) => (
										<Card
											key={topic}
											className={`cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
												config.topic === topic
													? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
													: ""
											}`}
											onClick={() => updateConfig("topic", topic)}>
											<CardContent className="p-3">
												<div className="flex items-center justify-between">
													<span className="font-medium">{topic}</span>
													{config.topic === topic && (
														<Check className="h-4 w-4 text-primary-600" />
													)}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>

							{/* Level Selection */}
							<div className="space-y-4">
								<Label className="text-base font-semibold">Your Level</Label>
								<div className="space-y-2">
									{levels.map((level) => (
										<Card
											key={level.value}
											className={`cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
												config.level === level.value
													? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
													: ""
											}`}
											onClick={() => updateConfig("level", level.value)}>
											<CardContent className="p-4">
												<div className="flex items-center justify-between">
													<div>
														<h3 className="font-semibold">{level.label}</h3>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															{level.description}
														</p>
													</div>
													{config.level === level.value && (
														<Check className="h-5 w-5 text-primary-600" />
													)}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</div>
					</div>
				);

			case 3:
				const selectedLanguage = languages.find(
					(l) => l.value === config.language
				);
				return (
					<div className="space-y-6">
						<div className="text-center">
							<h2 className="text-2xl font-bold mb-2">Ready to Start!</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Review your session settings below
							</p>
						</div>

						<Card className="dark:bg-gray-800 dark:border-gray-700">
							<CardHeader>
								<CardTitle>Session Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label className="font-semibold">Language</Label>
										<div className="flex items-center gap-2">
											<span className="text-2xl">{selectedLanguage?.flag}</span>
											<span>{selectedLanguage?.label}</span>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="font-semibold">Voice</Label>
										<p className="capitalize">
											{config.gender} • {config.accent}
										</p>
									</div>
									<div className="space-y-2">
										<Label className="font-semibold">Topic</Label>
										<p>{config.topic}</p>
									</div>
									<div className="space-y-2">
										<Label className="font-semibold">Level</Label>
										<p className="capitalize">{config.level}</p>
									</div>
								</div>
								<div className="space-y-2">
									<Label className="font-semibold">Tutor Context</Label>
									<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
										{config.context}
									</p>
								</div>
							</CardContent>
						</Card>

						<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
							<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
								Session Details
							</h3>
							<ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
								<li>• Session duration: 5 minutes</li>
								<li>• You can pause or stop anytime</li>
								<li>• AI will provide real-time feedback</li>
							</ul>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center">
			<AiSessionHeader>
				<div className="flex justify-center">
					<div className="text-center">
						<h1 className="text-xl font-bold text-gray-900 dark:text-white">
							{steps[currentStep].title}
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Step {currentStep + 1} of {steps.length}
						</p>
					</div>
				</div>
			</AiSessionHeader>

			<div className="w-full max-w-4xl p-6">
				{/* Stepper */}
				<div className="flex items-center justify-center mb-8">
					{steps.map((step, index) => (
						<div key={index} className="flex items-center">
							<div
								className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
									index <= currentStep
										? "bg-primary-500 border-primary-500 text-white"
										: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
								}`}>
								{index < currentStep ? (
									<Check className="h-5 w-5" />
								) : (
									<step.icon className="h-5 w-5" />
								)}
							</div>
							{index < steps.length - 1 && (
								<div
									className={`w-12 sm:w-20 h-0.5 mx-2 ${
										index < currentStep
											? "bg-primary-500"
											: "bg-gray-300 dark:bg-gray-600"
									}`}
								/>
							)}
						</div>
					))}
				</div>

				{/* Content */}
				<Card className="dark:bg-gray-800 dark:border-gray-700 mb-8">
					<CardContent className="p-8">{renderStepContent()}</CardContent>
				</Card>

				{/* Navigation */}
				<div className="flex justify-between">
					<Button
						variant="outline"
						onClick={handlePrevious}
						disabled={currentStep === 0}
						className="flex items-center gap-2">
						<ChevronLeft className="h-4 w-4" />
						Previous
					</Button>

					{currentStep === steps.length - 1 ? (
						<Button
							onClick={handleStartSession}
							size="lg"
							className="flex items-center gap-2">
							<Play className="h-4 w-4" />
							Start Session
						</Button>
					) : (
						<Button onClick={handleNext} className="flex items-center gap-2">
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
