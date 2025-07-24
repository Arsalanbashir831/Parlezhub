"use client";

import { useRef } from "react";
import { Upload, Settings } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { AITutorSettings } from "@/types/ai-tutor";

interface TutorConfigurationProps {
	settings: AITutorSettings;
	isEditing: boolean;
	onSettingChange: (key: keyof AITutorSettings, value: string) => void;
}

export default function TutorConfiguration({
	settings,
	isEditing,
	onSettingChange,
}: TutorConfigurationProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				onSettingChange("avatar", reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
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
					<p className="text-xs text-gray-500 text-center">
						Upload a profile picture for your AI tutor. This will be used in the
						chat interface.
					</p>
				</div>

				{/* Name */}
				<div className="space-y-2">
					<Label htmlFor="name">Tutor Name</Label>
					<Input
						id="name"
						value={settings.name}
						onChange={(e) => onSettingChange("name", e.target.value)}
						placeholder="Enter tutor name"
						maxLength={20}
						disabled={!isEditing}
					/>
				</div>

				{/* Gender */}
				<div className="space-y-2">
					<Label htmlFor="gender">Gender</Label>
					<Select
						value={settings.gender}
						onValueChange={(value) => onSettingChange("gender", value)}>
						<SelectTrigger disabled={!isEditing}>
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
						onChange={(e) => onSettingChange("context", e.target.value)}
						placeholder="Describe how you want your AI tutor to behave..."
						rows={4}
						maxLength={500}
						disabled={!isEditing}
					/>
					<p className="text-xs text-gray-500">
						This helps the AI understand your preferred teaching style and
						personality
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
