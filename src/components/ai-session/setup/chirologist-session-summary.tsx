"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSession } from "@/contexts/session-context";
import { PALM_TYPES, CHIROLOGIST_EXPERIENCE } from "@/constants/ai-chirologist-session";

export default function ChirologistSessionSummary() {
	const { config } = useSession();
	const selectedPalm = PALM_TYPES.find((p) => p.value === config.palmType);
	const selectedExperience = CHIROLOGIST_EXPERIENCE.find((e) => e.value === config.experience);

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-2">Ready for Your Reading!</h2>
				<p className="text-gray-600 dark:text-gray-400">
					Review your palm reading preferences below
				</p>
			</div>

			<Card className="dark:bg-gray-800 dark:border-gray-700">
				<CardHeader>
					<CardTitle>Reading Summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label className="font-semibold">Palm Selection</Label>
							<div className="flex items-center gap-2">
								<span className="text-2xl">🤚</span>
								<div>
									<p className="font-medium">{selectedPalm?.label}</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{selectedPalm?.description}
									</p>
								</div>
							</div>
						</div>
						<div className="space-y-2">
							<Label className="font-semibold">Reading Focus</Label>
							<p>{config.readingFocus}</p>
						</div>
						<div className="space-y-2">
							<Label className="font-semibold">Experience Level</Label>
							<div>
								<p className="font-medium">{selectedExperience?.label}</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{selectedExperience?.description}
								</p>
							</div>
						</div>
						<div className="space-y-2">
							<Label className="font-semibold">Session Type</Label>
							<p>Palm Reading Session</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
				<h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
					What to Expect
				</h3>
				<ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
					<li>• Detailed analysis of your palm lines</li>
					<li>• Personalized insights and interpretations</li>
					<li>• Guidance based on your reading focus</li>
					<li>• Interactive Q&A with your AI chirologist</li>
				</ul>
			</div>
		</div>
	);
} 