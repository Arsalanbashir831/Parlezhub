"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, User, Globe, Volume2 } from "lucide-react";

import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const createAvatarSchema = z.object({
	name: z.string().min(2, "Avatar name must be at least 2 characters"),
	language: z.string().min(1, "Please select a language"),
	accent: z.string().min(1, "Please select an accent"),
	gender: z.enum(["male", "female", "neutral"]),
	image: z.string().optional(),
});

type CreateAvatarForm = z.infer<typeof createAvatarSchema>;

interface CreateAvatarDialogProps {
	onClose: () => void;
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
];

const genderOptions = [
	{ value: "female", label: "Female", icon: "👩" },
	{ value: "male", label: "Male", icon: "👨" },
	{ value: "neutral", label: "Neutral", icon: "🤖" },
];

export function CreateAvatarDialog({ onClose }: CreateAvatarDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string>("");
	const [step, setStep] = useState(1);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CreateAvatarForm>({
		resolver: zodResolver(createAvatarSchema),
	});

	const selectedLanguage = watch("language");
	const selectedGender = watch("gender");
	const avatarName = watch("name");

	const selectedLanguageData = languages.find(
		(lang) => lang.value === selectedLanguage
	);

	const onSubmit = async (data: CreateAvatarForm) => {
		setIsLoading(true);
		try {
			// API call to create avatar
			console.log("Creating avatar:", data);
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 2000));
			onClose();
		} catch (error) {
			console.error("Failed to create avatar:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				setSelectedImage(result);
				setValue("image", result);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
			<DialogHeader>
				<DialogTitle>Create AI Language Tutor</DialogTitle>
				<DialogDescription>
					Customize your personal AI tutor for language learning
				</DialogDescription>
			</DialogHeader>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{step === 1 && (
					<div className="space-y-6">
						{/* Avatar Image */}
						<div className="flex flex-col items-center gap-4">
							<Avatar className="h-24 w-24">
								<AvatarImage src={selectedImage || "/placeholder.svg"} />
								<AvatarFallback className="bg-primary-100 text-primary-700 text-2xl">
									{avatarName?.charAt(0)?.toUpperCase() || "?"}
								</AvatarFallback>
							</Avatar>
							<div>
								<Label htmlFor="image-upload" className="cursor-pointer">
									<Button type="button" variant="outline" size="sm" asChild>
										<span>
											<Upload className="h-4 w-4 mr-2" />
											Upload Image
										</span>
									</Button>
								</Label>
								<input
									id="image-upload"
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleImageUpload}
								/>
								<p className="text-xs text-gray-500 mt-1 text-center">
									Optional: Upload a custom avatar image
								</p>
							</div>
						</div>

						{/* Avatar Name */}
						<div>
							<Label htmlFor="name">Avatar Name</Label>
							<div className="relative mt-1">
								<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									id="name"
									placeholder="e.g., Sofia, Pierre, Yuki"
									className={cn("pl-10", errors.name && "border-red-500")}
									{...register("name")}
								/>
							</div>
							{errors.name && (
								<p className="text-sm text-red-600 mt-1">
									{errors.name.message}
								</p>
							)}
						</div>

						{/* Gender Selection */}
						<div>
							<Label>Gender</Label>
							<RadioGroup
								value={selectedGender}
								onValueChange={(value: "male" | "female" | "neutral") =>
									setValue("gender", value)
								}
								className="flex gap-4 mt-2">
								{genderOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-2">
										<RadioGroupItem value={option.value} id={option.value} />
										<Label
											htmlFor={option.value}
											className="flex items-center gap-2 cursor-pointer">
											<span className="text-lg">{option.icon}</span>
											{option.label}
										</Label>
									</div>
								))}
							</RadioGroup>
							{errors.gender && (
								<p className="text-sm text-red-600 mt-1">
									{errors.gender.message}
								</p>
							)}
						</div>

						<Button type="button" onClick={() => setStep(2)} className="w-full">
							Next: Language Settings
						</Button>
					</div>
				)}

				{step === 2 && (
					<div className="space-y-6">
						{/* Language Selection */}
						<div>
							<Label htmlFor="language">Language to Learn</Label>
							<div className="relative mt-1">
								<Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
								<Select onValueChange={(value) => setValue("language", value)}>
									<SelectTrigger className="pl-10">
										<SelectValue placeholder="Select a language" />
									</SelectTrigger>
									<SelectContent>
										{languages.map((language) => (
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

						<div className="flex gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => setStep(1)}
								className="flex-1">
								Back
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
								className="flex-1 bg-primary-500 hover:bg-primary-600">
								{isLoading ? "Creating..." : "Create Avatar"}
							</Button>
						</div>
					</div>
				)}
			</form>
		</DialogContent>
	);
}
