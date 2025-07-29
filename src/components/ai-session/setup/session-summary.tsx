"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSession } from "@/contexts/session-context";
import { LANGUAGES, NATIVE_LANGUAGES } from "@/constants/ai-session";

export default function SessionSummary() {
	const { config } = useSession();
	const selectedLanguage = LANGUAGES.find((l) => l.value === config.language);
	const selectedNativeLanguage = NATIVE_LANGUAGES.find((l) => l.value === config.nativeLanguage);

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
							<Label className="font-semibold">Your Native Language</Label>
							<div className="flex items-center gap-2">
								<span className="text-2xl">{selectedNativeLanguage?.flag}</span>
								<span>{selectedNativeLanguage?.label}</span>
							</div>
						</div>
						<div className="space-y-2">
							<Label className="font-semibold">Learning Language</Label>
							<div className="flex items-center gap-2">
								<span className="text-2xl">{selectedLanguage?.flag}</span>
								<span>{selectedLanguage?.label}</span>
							</div>
						</div>
						<div className="space-y-2">
							<Label className="font-semibold">Topic</Label>
							<p>{config.topic}</p>
						</div>
						<div className="space-y-2">
							<Label className="font-semibold">Voice</Label>
							<p className="capitalize">
								{config.gender} • {config.accent}
							</p>
						</div>
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
}
