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
	const {
		settings,
		isEditing,
		isSaving,
		hasChanges,
		validateSettings,
		startEditing,
		cancelEditing,
		updateTempSetting,
		saveSettings,
	} = useAITutor();

	const handleStartSession = () => {
		router.push(ROUTES.AI_SESSION.SETUP);
	};

	const handleSave = async () => {
		const success = await saveSettings();
		if (!success) {
			// Could add toast notification here
			console.error("Failed to save settings");
		}
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
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
				<div className="flex-1 min-w-0">
					<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
						AI Tutor Settings
					</h1>
					<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
						Customize your AI language tutor experience
					</p>
				</div>
				<div className="flex-shrink-0 w-full sm:w-auto">
					<TutorActions
						isEditing={isEditing}
						isSaving={isSaving}
						hasChanges={hasChanges}
						isValid={validateSettings}
						onStartSession={handleStartSession}
						onEdit={startEditing}
						onSave={handleSave}
						onCancel={cancelEditing}
					/>
				</div>
			</div>

			{/* AI Tutor Configuration */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
				{/* Tutor Settings */}
				<div className="order-2 xl:order-1">
					<TutorConfiguration
						settings={settings}
						isEditing={isEditing}
						onSettingChange={updateTempSetting}
					/>
				</div>

				{/* Preview */}
				<div className="space-y-4 sm:space-y-6 order-1 xl:order-2">
					<TutorPreview settings={settings} />
				</div>
			</div>
		</div>
	);
}
