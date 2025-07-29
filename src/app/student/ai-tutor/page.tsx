"use client";

import { useRouter } from "next/navigation";
import { useAITutor } from "@/hooks/useAITutor";
import { ROUTES } from "@/constants/routes";
import {
	TutorConfiguration,
	TutorPreview,
	TutorActions,
} from "@/components/ai-tutor";

export default function AITutorPage() {
	const router = useRouter();
	const { settings, updateTempSetting } = useAITutor();

	const handleStartSession = () => {
		router.push(ROUTES.AI_SESSION.SETUP);
	};

	if (!settings) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-primary-500"></div>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
			{/* Header */}
			<div className="text-center space-y-2">
				<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
					AI Language Tutor
				</h1>
				<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
					Configure and start practicing with your personalized AI tutor
				</p>
			</div>

			{/* AI Tutor Configuration */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
				{/* Tutor Configuration */}
				<div className="order-2 xl:order-1">
					<TutorConfiguration 
						settings={settings} 
						onSettingChange={updateTempSetting}
					/>
				</div>

				{/* Session Preview */}
				<div className="space-y-4 sm:space-y-6 order-1 xl:order-2">
					<TutorPreview settings={settings} />
				</div>
			</div>

			{/* Action Button */}
			<div className="flex justify-center pt-4">
				<TutorActions onStartSession={handleStartSession} />
			</div>
		</div>
	);
}
