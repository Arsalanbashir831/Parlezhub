"use client";

import { useState, useRef } from "react";
import { Upload, Play, Settings, User, Mic, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";

interface AITutorSettings {
	name: string;
	gender: "male" | "female" | "neutral";
	avatar: string;
	context: string;
}

export default function AITutorPage() {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [settings, setSettings] = useState<AITutorSettings>({
		name: "Alex",
		gender: "male",
		avatar: "",
		context:
			"You are a friendly and patient language tutor who helps students practice conversation skills.",
	});

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setSettings((prev) => ({
					...prev,
					avatar: reader.result as string,
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSettingChange = (key: keyof AITutorSettings, value: string) => {
		setSettings((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleStartSession = () => {
		// Navigate to session setup stepper
		router.push(ROUTES.AI_SESSION.SETUP);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
						AI Tutor Settings
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						Customize your AI language tutor experience
					</p>
				</div>
				<Button onClick={handleStartSession} size="lg" className="gap-2">
					<Play className="h-4 w-4" />
					Start Session
				</Button>
			</div>

			{/* AI Tutor Configuration */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Tutor Settings */}
				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Tutor Configuration
						</CardTitle>
						<CardDescription>
							Customize your AI tutor's appearance and personality
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Avatar Upload */}
						<div className="flex flex-col items-center space-y-4">
							<div className="relative">
								<Avatar className="h-24 w-24">
									<AvatarImage src={settings.avatar || "/placeholder.svg"} />
									<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-2xl">
										{settings.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<Button
									variant="outline"
									size="sm"
									className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
									onClick={() => fileInputRef.current?.click()}>
									<Upload className="h-3 w-3" />
								</Button>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleImageUpload}
									className="hidden"
								/>
							</div>
							<p className="text-sm text-gray-500 text-center">
								Upload a custom avatar for your AI tutor
							</p>
						</div>

						{/* Name */}
						<div className="space-y-2">
							<Label htmlFor="name">Tutor Name</Label>
							<Input
								id="name"
								value={settings.name}
								onChange={(e) => handleSettingChange("name", e.target.value)}
								placeholder="Enter tutor name"
							/>
						</div>

						{/* Gender */}
						<div className="space-y-2">
							<Label htmlFor="gender">Gender</Label>
							<Select
								value={settings.gender}
								onValueChange={(value) => handleSettingChange("gender", value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select gender" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="male">Male</SelectItem>
									<SelectItem value="female">Female</SelectItem>
									<SelectItem value="neutral">Neutral</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Context */}
						<div className="space-y-2">
							<Label htmlFor="context">Tutor Context & Personality</Label>
							<Textarea
								id="context"
								value={settings.context}
								onChange={(e) => handleSettingChange("context", e.target.value)}
								placeholder="Describe how you want your AI tutor to behave..."
								rows={4}
							/>
							<p className="text-xs text-gray-500">
								This helps the AI understand your preferred teaching style and
								personality
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Preview & Quick Stats */}
				<div className="space-y-6">
					{/* Tutor Preview */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle>Tutor Preview</CardTitle>
							<CardDescription>
								See how your AI tutor will appear
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<Avatar className="h-16 w-16">
									<AvatarImage src={settings.avatar || "/placeholder.svg"} />
									<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-xl">
										{settings.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<h3 className="font-semibold text-lg">{settings.name}</h3>
									<div className="flex items-center gap-2 mt-1">
										<Badge variant="secondary" className="text-xs">
											{settings.gender}
										</Badge>
									</div>
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
										{settings.context}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
