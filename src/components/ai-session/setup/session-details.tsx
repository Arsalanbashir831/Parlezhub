"use client";

import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSession } from "@/contexts/session-context";
import { TOPICS, LEVELS } from "@/constants/ai-session";

export default function SessionDetails() {
	const { config, updateConfig } = useSession();

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
					<Label className="text-base font-semibold">Conversation Topic</Label>
					<div className="grid grid-cols-1 gap-2">
						{TOPICS.map((topic) => (
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
						{LEVELS.map((level) => (
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
}
