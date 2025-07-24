"use client";

import { useState, useEffect } from "react";
import { AITutorSettings } from "@/types/ai-tutor";
import {
	loadAITutorSettings,
	saveAITutorSettings,
	validateTutorName,
	validateTutorContext,
} from "@/lib/ai-tutor-utils";

export function useAITutor() {
	const [settings, setSettings] = useState<AITutorSettings | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [tempSettings, setTempSettings] = useState<AITutorSettings | null>(
		null
	);
	const [isSaving, setIsSaving] = useState(false);

	// Load settings on mount
	useEffect(() => {
		const loadedSettings = loadAITutorSettings();
		setSettings(loadedSettings);
	}, []);

	const startEditing = () => {
		if (settings) {
			setTempSettings({ ...settings });
			setIsEditing(true);
		}
	};

	const cancelEditing = () => {
		setTempSettings(null);
		setIsEditing(false);
	};

	const updateTempSetting = (key: keyof AITutorSettings, value: string) => {
		if (tempSettings) {
			setTempSettings((prev) => (prev ? { ...prev, [key]: value } : null));
		}
	};

	const validateSettings = (settingsToValidate: AITutorSettings): boolean => {
		return (
			validateTutorName(settingsToValidate.name) &&
			validateTutorContext(settingsToValidate.context)
		);
	};

	const saveSettings = async (): Promise<boolean> => {
		if (!tempSettings || !validateSettings(tempSettings)) {
			return false;
		}

		setIsSaving(true);

		try {
			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			saveAITutorSettings(tempSettings);
			setSettings(tempSettings);
			setTempSettings(null);
			setIsEditing(false);
			return true;
		} catch (error) {
			console.error("Failed to save AI tutor settings:", error);
			return false;
		} finally {
			setIsSaving(false);
		}
	};

	const hasChanges =
		tempSettings && settings
			? JSON.stringify(tempSettings) !== JSON.stringify(settings)
			: false;

	const currentSettings = isEditing ? tempSettings : settings;

	return {
		settings: currentSettings,
		originalSettings: settings,
		isEditing,
		isSaving,
		hasChanges,
		startEditing,
		cancelEditing,
		updateTempSetting,
		saveSettings,
		validateSettings: currentSettings
			? validateSettings(currentSettings)
			: false,
	};
}
