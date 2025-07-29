"use client";

import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSession } from "@/contexts/session-context";
import { CHIROLOGIST_EXPERIENCE } from "@/constants/ai-chirologist-session";

export default function ExperienceLevel() {
	const { config, updateConfig } = useSession();

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-2">Your Experience</h2>
				<p className="text-gray-600 dark:text-gray-400">
					How familiar are you with palm reading?
				</p>
			</div>

			<div className="max-w-2xl mx-auto space-y-4">
				<Label className="text-base font-semibold">Experience Level</Label>
				<div className="space-y-3">
					{CHIROLOGIST_EXPERIENCE.map((exp) => (
						<Card
							key={exp.value}
							className={`cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
								config.experience === exp.value
									? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
									: ""
							}`}
							onClick={() => updateConfig("experience", exp.value)}>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-semibold">{exp.label}</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{exp.description}
										</p>
									</div>
									{config.experience === exp.value && (
										<Check className="h-5 w-5 text-primary-600" />
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