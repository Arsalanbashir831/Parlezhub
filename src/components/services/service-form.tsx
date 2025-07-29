"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, DollarSign, Clock } from "lucide-react";
import { ServiceFormData, ServiceType } from "@/types/service";
import { getServiceTypeLabel } from "@/lib/service-utils";

const serviceFormSchema = z.object({
	type: z.enum(["consultancy", "chirologist"]),
	title: z.string().min(10, "Title must be at least 10 characters").max(80, "Title must not exceed 80 characters"),
	description: z.string().min(100, "Description must be at least 100 characters").max(1200, "Description must not exceed 1200 characters"),
	shortDescription: z.string().min(20, "Short description must be at least 20 characters").max(160, "Short description must not exceed 160 characters"),
	price: z.number().min(5, "Price must be at least $5").max(1000, "Price must not exceed $1000"),
	duration: z.number().min(15, "Duration must be at least 15 minutes").max(300, "Duration must not exceed 5 hours"),
	tags: z.array(z.string()).min(1, "At least one tag is required").max(5, "Maximum 5 tags allowed"),
	whatYouProvide: z.array(z.string()).min(1, "At least one service item is required").max(10, "Maximum 10 service items allowed")
});

interface ServiceFormProps {
	initialData?: Partial<ServiceFormData>;
	onSubmit: (data: ServiceFormData) => Promise<void>;
	onCancel?: () => void;
	isLoading?: boolean;
	mode?: "create" | "edit";
	availableTypes?: ServiceType[];
}

export default function ServiceForm({
	initialData,
	onSubmit,
	onCancel,
	isLoading = false,
	mode = "create",
	availableTypes = ["consultancy", "chirologist"]
}: ServiceFormProps) {
	const [newTag, setNewTag] = useState("");
	const [newService, setNewService] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
		getValues
	} = useForm<ServiceFormData>({
		resolver: zodResolver(serviceFormSchema),
		defaultValues: {
			type: "consultancy",
			title: "",
			description: "",
			shortDescription: "",
			price: 25,
			duration: 60,
			tags: [],
			whatYouProvide: [],
			...initialData
		}
	});

	const watchedFields = watch();

	const addTag = () => {
		if (newTag.trim() && watchedFields.tags.length < 5) {
			const currentTags = getValues("tags");
			if (!currentTags.includes(newTag.trim())) {
				setValue("tags", [...currentTags, newTag.trim()]);
				setNewTag("");
			}
		}
	};

	const removeTag = (tagToRemove: string) => {
		const currentTags = getValues("tags");
		setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
	};

	const addService = () => {
		if (newService.trim() && watchedFields.whatYouProvide.length < 10) {
			const currentServices = getValues("whatYouProvide");
			setValue("whatYouProvide", [...currentServices, newService.trim()]);
			setNewService("");
		}
	};

	const removeService = (index: number) => {
		const currentServices = getValues("whatYouProvide");
		setValue("whatYouProvide", currentServices.filter((_, i) => i !== index));
	};

	const onFormSubmit = async (data: ServiceFormData) => {
		try {
			await onSubmit(data);
		} catch (error) {
			console.error("Error submitting service form:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Service Type */}
						<div>
							<Label htmlFor="type">Service Type</Label>
							<Select
								value={watchedFields.type}
								onValueChange={(value: ServiceType) => setValue("type", value)}
								disabled={mode === "edit"}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select service type" />
								</SelectTrigger>
								<SelectContent>
									{availableTypes.map((type) => (
										<SelectItem key={type} value={type}>
											{getServiceTypeLabel(type)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.type && (
								<p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
							)}
						</div>

						{/* Title */}
						<div>
							<Label htmlFor="title">Service Title</Label>
							<Input
								id="title"
								{...register("title")}
								placeholder="I will provide professional language consultation..."
								maxLength={80}
							/>
							<div className="flex justify-between text-sm text-gray-500 mt-1">
								{errors.title && (
									<span className="text-red-600">{errors.title.message}</span>
								)}
								<span className="ml-auto">{watchedFields.title?.length || 0}/80</span>
							</div>
						</div>

						{/* Short Description */}
						<div>
							<Label htmlFor="shortDescription">Short Description</Label>
							<Textarea
								id="shortDescription"
								{...register("shortDescription")}
								placeholder="Brief summary of what you offer..."
								rows={2}
								maxLength={160}
							/>
							<div className="flex justify-between text-sm text-gray-500 mt-1">
								{errors.shortDescription && (
									<span className="text-red-600">{errors.shortDescription.message}</span>
								)}
								<span className="ml-auto">{watchedFields.shortDescription?.length || 0}/160</span>
							</div>
						</div>

						{/* Description */}
						<div>
							<Label htmlFor="description">Full Description</Label>
							<Textarea
								id="description"
								{...register("description")}
								placeholder="Detailed description of your service..."
								rows={6}
								maxLength={1200}
							/>
							<div className="flex justify-between text-sm text-gray-500 mt-1">
								{errors.description && (
									<span className="text-red-600">{errors.description.message}</span>
								)}
								<span className="ml-auto">{watchedFields.description?.length || 0}/1200</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Pricing & Session Details */}
				<Card>
					<CardHeader>
						<CardTitle>Pricing & Session Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Price */}
						<div>
							<Label htmlFor="price">Price per Session (USD)</Label>
							<div className="relative">
								<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									id="price"
									type="number"
									{...register("price", { valueAsNumber: true })}
									className="pl-10"
									placeholder="25"
									min={5}
									max={1000}
								/>
							</div>
							{errors.price && (
								<p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
							)}
						</div>

						{/* Duration */}
						<div>
							<Label htmlFor="duration">Session Duration (minutes)</Label>
							<div className="relative">
								<Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									id="duration"
									type="number"
									{...register("duration", { valueAsNumber: true })}
									className="pl-10"
									placeholder="60"
									min={15}
									max={300}
								/>
							</div>
							{errors.duration && (
								<p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Tags */}
			<Card>
				<CardHeader>
					<CardTitle>Tags</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							placeholder="Add a tag..."
							onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
							maxLength={20}
						/>
						<Button type="button" onClick={addTag} variant="outline" size="sm">
							<Plus className="h-4 w-4" />
						</Button>
					</div>
					
					<div className="flex flex-wrap gap-2">
						{watchedFields.tags?.map((tag, index) => (
							<Badge key={index} variant="secondary" className="flex items-center gap-1">
								{tag}
								<X
									className="h-3 w-3 cursor-pointer hover:text-red-500"
									onClick={() => removeTag(tag)}
								/>
							</Badge>
						))}
					</div>
					
					{errors.tags && (
						<p className="text-sm text-red-600">{errors.tags.message}</p>
					)}
				</CardContent>
			</Card>

			{/* What You Provide */}
			<Card>
				<CardHeader>
					<CardTitle>What You Provide</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							value={newService}
							onChange={(e) => setNewService(e.target.value)}
							placeholder="Add what you will provide in your session..."
							onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
						/>
						<Button type="button" onClick={addService} variant="outline" size="sm">
							<Plus className="h-4 w-4" />
						</Button>
					</div>
					
					<div className="space-y-2">
						{watchedFields.whatYouProvide?.map((item, index) => (
							<div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
								<span className="text-sm">{item}</span>
								<X
									className="h-4 w-4 cursor-pointer hover:text-red-500"
									onClick={() => removeService(index)}
								/>
							</div>
						))}
					</div>
					
					{errors.whatYouProvide && (
						<p className="text-sm text-red-600">{errors.whatYouProvide.message}</p>
					)}
				</CardContent>
			</Card>

			{/* Form Actions */}
			<div className="flex justify-end gap-3">
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				)}
				<Button type="submit" disabled={isLoading}>
					{isLoading ? "Saving..." : mode === "create" ? "Create Service" : "Update Service"}
				</Button>
			</div>
		</form>
	);
} 