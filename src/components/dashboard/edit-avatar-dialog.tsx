"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, User } from "lucide-react";

import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const editAvatarSchema = z.object({
	name: z.string().min(2, "Avatar name must be at least 2 characters"),
	gender: z.enum(["male", "female", "neutral"]),
	image: z.string().optional(),
});

type EditAvatarForm = z.infer<typeof editAvatarSchema>;

interface EditAvatarDialogProps {
	avatar: any;
	onClose: () => void;
	onSuccess: (updatedAvatar: any) => void;
}

const genderOptions = [
	{ value: "female", label: "Female", icon: "👩" },
	{ value: "male", label: "Male", icon: "👨" },
	{ value: "neutral", label: "Neutral", icon: "🤖" },
];

export function EditAvatarDialog({
	avatar,
	onClose,
	onSuccess,
}: EditAvatarDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string>(
		avatar.image || ""
	);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<EditAvatarForm>({
		resolver: zodResolver(editAvatarSchema),
		defaultValues: {
			name: avatar.name,
			gender: avatar.gender,
			image: avatar.image,
		},
	});

	const selectedGender = watch("gender");
	const avatarName = watch("name");

	const onSubmit = async (data: EditAvatarForm) => {
		setIsLoading(true);
		try {
			// API call to update avatar
			const updatedAvatar = {
				...avatar,
				...data,
				image: selectedImage,
			};

			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000));
			onSuccess(updatedAvatar);
		} catch (error) {
			console.error("Failed to update avatar:", error);
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
		<DialogContent className="sm:max-w-[400px]">
			<DialogHeader>
				<DialogTitle>Edit AI Tutor</DialogTitle>
				<DialogDescription>
					Update your AI tutor's appearance and details
				</DialogDescription>
			</DialogHeader>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
									Change Image
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
					</div>
				</div>

				{/* Avatar Name */}
				<div>
					<Label htmlFor="name">Avatar Name</Label>
					<div className="relative mt-1">
						<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							id="name"
							placeholder="e.g., Alex, Sam, Jordan"
							className={cn("pl-10", errors.name && "border-red-500")}
							{...register("name")}
						/>
					</div>
					{errors.name && (
						<p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
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
							<div key={option.value} className="flex items-center space-x-2">
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
						<p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
					)}
				</div>

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
						disabled={isLoading}
						className="flex-1 bg-primary-500 hover:bg-primary-600">
						{isLoading ? "Updating..." : "Update Avatar"}
					</Button>
				</div>
			</form>
		</DialogContent>
	);
}
