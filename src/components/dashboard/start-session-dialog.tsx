"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Mic, Video, BookOpen, Target } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogPortal,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StartSessionDialogProps {
	avatar: any;
	language: any;
	onClose: () => void;
}

const sessionTypes = [
	{
		id: "conversation",
		title: "Free Conversation",
		description: "Open-ended chat about any topic",
		icon: MessageCircle,
		duration: "15-30 min",
		difficulty: "Any level",
	},
	{
		id: "pronunciation",
		title: "Pronunciation Practice",
		description: "Focus on accent and pronunciation",
		icon: Mic,
		duration: "10-20 min",
		difficulty: "Beginner+",
	},
	{
		id: "grammar",
		title: "Grammar Focus",
		description: "Practice specific grammar rules",
		icon: BookOpen,
		duration: "20-30 min",
		difficulty: "Intermediate+",
	},
	{
		id: "roleplay",
		title: "Role-Play Scenarios",
		description: "Practice real-world situations",
		icon: Video,
		duration: "15-25 min",
		difficulty: "Any level",
	},
];

const topics = [
	"Daily Life",
	"Travel",
	"Food & Dining",
	"Work & Business",
	"Hobbies",
	"Family & Friends",
	"Shopping",
	"Health",
	"Weather",
	"Culture",
	"Random Topic",
];

export function StartSessionDialog({
	avatar,
	language,
	onClose,
}: StartSessionDialogProps) {
	const [selectedSessionType, setSelectedSessionType] = useState("");
	const [selectedTopic, setSelectedTopic] = useState("");
	const [isStarting, setIsStarting] = useState(false);
	const router = useRouter();

	const handleStartSession = async () => {
		setIsStarting(true);
		try {
			// Create session data
			const sessionData = {
				avatarId: avatar.id,
				language: language.code,
				sessionType: selectedSessionType,
				topic: selectedTopic,
				timestamp: new Date().toISOString(),
			};

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Navigate to AI session interface
			router.push(
				`/dashboard/ai-session?session=${encodeURIComponent(
					JSON.stringify(sessionData)
				)}`
			);
			onClose();
		} catch (error) {
			console.error("Failed to start session:", error);
		} finally {
			setIsStarting(false);
		}
	};

	return (
		<Dialog>
			<DialogPortal>
				<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Start AI Session</DialogTitle>
						<DialogDescription>
							Choose your session type and topic to begin practicing{" "}
							{language?.name} with {avatar?.name}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6">
						{/* Avatar & Language Info */}
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-4">
									<Avatar className="h-16 w-16">
										<AvatarImage src={avatar?.image || "/placeholder.svg"} />
										<AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
											{avatar?.name?.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div>
										<h3 className="font-semibold text-lg">{avatar?.name}</h3>
										<p className="text-gray-600">
											{language?.name} • {language?.accent} accent
										</p>
										<Badge variant="secondary" className="mt-1">
											{language?.level}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Session Type Selection */}
						<div>
							<Label className="text-base font-medium">
								Choose Session Type
							</Label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
								{sessionTypes.map((type) => (
									<Card
										key={type.id}
										className={`cursor-pointer transition-all hover:shadow-md ${
											selectedSessionType === type.id
												? "ring-2 ring-primary-500 bg-primary-50"
												: ""
										}`}
										onClick={() => setSelectedSessionType(type.id)}>
										<CardHeader className="pb-2">
											<div className="flex items-center gap-2">
												<type.icon className="h-5 w-5 text-primary-600" />
												<CardTitle className="text-sm">{type.title}</CardTitle>
											</div>
										</CardHeader>
										<CardContent className="pt-0">
											<CardDescription className="text-xs mb-2">
												{type.description}
											</CardDescription>
											<div className="flex justify-between text-xs text-gray-500">
												<span>{type.duration}</span>
												<span>{type.difficulty}</span>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>

						{/* Topic Selection */}
						{selectedSessionType && (
							<div>
								<Label htmlFor="topic">Choose Topic (Optional)</Label>
								<Select value={selectedTopic} onValueChange={setSelectedTopic}>
									<SelectTrigger className="mt-2">
										<SelectValue placeholder="Select a topic or let AI choose" />
									</SelectTrigger>
									<SelectContent>
										{topics.map((topic) => (
											<SelectItem key={topic} value={topic}>
												{topic}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						{/* Session Preview */}
						{selectedSessionType && (
							<Card className="bg-blue-50 border-blue-200">
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<Target className="h-5 w-5 text-blue-600 mt-0.5" />
										<div>
											<h4 className="font-medium text-blue-900">
												Session Preview
											</h4>
											<p className="text-sm text-blue-700 mt-1">
												You'll practice {language?.name} with {avatar?.name}{" "}
												through{" "}
												{sessionTypes
													.find((t) => t.id === selectedSessionType)
													?.title.toLowerCase()}
												{selectedTopic &&
													` focusing on ${selectedTopic.toLowerCase()}`}
												. The session will be recorded for your progress report.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Action Buttons */}
						<div className="flex gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								className="flex-1 bg-transparent">
								Cancel
							</Button>
							<Button
								onClick={handleStartSession}
								disabled={!selectedSessionType || isStarting}
								className="flex-1 bg-primary-500 hover:bg-primary-600">
								{isStarting ? "Starting Session..." : "Start Session"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
}
