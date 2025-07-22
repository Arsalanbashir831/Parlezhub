"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe, Volume2 } from "lucide-react";

import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const addLanguageSchema = z.object({
	language: z.string().min(1, "Please select a language"),
	accent: z.string().min(1, "Please select an accent"),
});

type AddLanguageForm = z.infer<typeof addLanguageSchema>;

interface AddLanguageDialogProps {
	onClose: () => void;
	onSuccess: (newLanguage: any) => void;
	existingLanguages: string[];
}

const languages = [
	{
		value: "spanish",
		label: "Spanish",
		accents: ["Mexican", "Spanish", "Argentinian", "Colombian"],
	},
	{
		value: "french",
		label: "French",
		accents: ["Parisian", "Canadian", "Belgian", "Swiss"],
	},
	{
		value: "german",
		label: "German",
		accents: ["Standard", "Austrian", "Swiss"],
	},
	{
		value: "italian",
		label: "Italian",
		accents: ["Standard", "Roman", "Milanese"],
	},
	{
		value: "portuguese",
		label: "Portuguese",
		accents: ["Brazilian", "European"],
	},
	{
		value: "japanese",
		label: "Japanese",
		accents: ["Tokyo", "Kansai", "Kyushu"],
	},
	{ value: "korean", label: "Korean", accents: ["Seoul", "Busan"] },
	{ value: "chinese", label: "Chinese", accents: ["Mandarin", "Cantonese"] },
	{ value: "russian", label: "Russian", accents: ["Moscow", "St. Petersburg"] },
	{
		value: "arabic",
		label: "Arabic",
		accents: ["Modern Standard", "Egyptian", "Levantine"],
	},
];

export function AddLanguageDialog({
	onClose,
	onSuccess,
	existingLanguages,
}: AddLanguageDialogProps) {
	const [isLoading, setIsLoading] = useState(false);

	const {
		watch,
		setValue,
		handleSubmit,
		formState: { errors },
	} = useForm<AddLanguageForm>({
		resolver: zodResolver(addLanguageSchema),
	});

	const selectedLanguage = watch("language");
	const selectedLanguageData = languages.find(
		(lang) => lang.value === selectedLanguage
	);
	const availableLanguages = languages.filter(
		(lang) => !existingLanguages.includes(lang.value)
	);

	const onSubmit = async (data: AddLanguageForm) => {
		setIsLoading(true);
		try {
			const selectedLang = languages.find(
				(lang) => lang.value === data.language
			);
			const newLanguage = {
				code: data.language,
				name: selectedLang?.label || data.language,
				accent: data.accent,
				level: "Beginner",
				conversationCount: 0,
				lastUsed: new Date().toISOString(),
				totalMinutes: 0,
			};

			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000));
			onSuccess(newLanguage);
		} catch (error) {
			console.error("Failed to add language:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DialogContent className="sm:max-w-[400px]">
			<DialogHeader>
				<DialogTitle>Add New Language</DialogTitle>
				<DialogDescription>
					Choose a new language to practice with your AI tutor
				</DialogDescription>
			</DialogHeader>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* Language Selection */}
				<div>
					<Label htmlFor="language">Language</Label>
					<div className="relative mt-1">
						<Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
						<Select onValueChange={(value) => setValue("language", value)}>
							<SelectTrigger className="pl-10">
								<SelectValue placeholder="Select a language" />
							</SelectTrigger>
							<SelectContent>
								{availableLanguages.map((language) => (
									<SelectItem key={language.value} value={language.value}>
										{language.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{errors.language && (
						<p className="text-sm text-red-600 mt-1">
							{errors.language.message}
						</p>
					)}
				</div>

				{/* Accent Selection */}
				{selectedLanguageData && (
					<div>
						<Label htmlFor="accent">Accent</Label>
						<div className="relative mt-1">
							<Volume2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
							<Select onValueChange={(value) => setValue("accent", value)}>
								<SelectTrigger className="pl-10">
									<SelectValue placeholder="Select an accent" />
								</SelectTrigger>
								<SelectContent>
									{selectedLanguageData.accents.map((accent) => (
										<SelectItem key={accent} value={accent}>
											{accent}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{errors.accent && (
							<p className="text-sm text-red-600 mt-1">
								{errors.accent.message}
							</p>
						)}
					</div>
				)}

				{availableLanguages.length === 0 && (
					<div className="text-center py-4">
						<p className="text-gray-600">
							You're already learning all available languages! 🎉
						</p>
					</div>
				)}

				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="flex-1 bg-transparent">
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isLoading || availableLanguages.length === 0}
						className="flex-1 bg-primary-500 hover:bg-primary-600">
						{isLoading ? "Adding..." : "Add Language"}
					</Button>
				</div>
			</form>
		</DialogContent>
	);
}
