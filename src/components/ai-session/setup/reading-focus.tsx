"use client";

import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSession } from "@/contexts/session-context";
import { READING_FOCUS } from "@/constants/ai-chirologist-session";

export default function ReadingFocus() {
	const { config, updateConfig } = useSession();

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-2">Reading Focus</h2>
				<p className="text-gray-600 dark:text-gray-400">
					What aspect of palm reading interests you most?
				</p>
			</div>

			<div className="max-w-2xl mx-auto space-y-4">
				<Label className="text-base font-semibold">Focus Area</Label>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{READING_FOCUS.map((focus) => (
						<Card
							key={focus}
							className={`cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
								config.readingFocus === focus
									? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
									: ""
							}`}
							onClick={() => updateConfig("readingFocus", focus)}>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<span className="font-medium">{focus}</span>
									{config.readingFocus === focus && (
										<Check className="h-4 w-4 text-primary-600" />
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
} 