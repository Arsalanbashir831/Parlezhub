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
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
			</div>
		);
	}

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

			{/* AI Tutor Configuration */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Tutor Settings */}
				<TutorConfiguration
					settings={settings}
					isEditing={isEditing}
					onSettingChange={updateTempSetting}
				/>

				{/* Preview */}
				<div className="space-y-6">
					<TutorPreview settings={settings} />
				</div>
			</div>
		</div>
	);
}
