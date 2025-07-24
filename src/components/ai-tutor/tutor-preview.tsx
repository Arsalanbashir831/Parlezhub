"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AITutorSettings } from "@/types/ai-tutor";

interface TutorPreviewProps {
	settings: AITutorSettings;
}

export default function TutorPreview({ settings }: TutorPreviewProps) {
	return (
		<Card className="dark:bg-gray-800 dark:border-gray-700">
			<CardHeader>
				<CardTitle>Tutor Preview</CardTitle>
				<CardDescription>See how your AI tutor will appear</CardDescription>
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
							<Badge variant="secondary" className="text-xs capitalize">
								{settings.gender}
							</Badge>
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
							{settings.context}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
