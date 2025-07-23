"use client";

import { useState } from "react";
import { Camera, MapPin, Clock, Star, Edit, Save, X } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function TeacherProfilePage() {
	const [isEditing, setIsEditing] = useState(false);
	const [profileData, setProfileData] = useState({
		name: "Sofia Martinez",
		email: "sofia.martinez@email.com",
		phone: "+1 (555) 123-4567",
		location: "Barcelona, Spain",
		bio: "Native Spanish speaker with 8+ years of teaching experience. Specialized in conversational Spanish, business communication, and cultural immersion. I love helping students gain confidence in speaking Spanish naturally.",
		languages: [
			"Spanish (Native)",
			"English (Fluent)",
			"French (Intermediate)",
		],
		specialties: [
			"Conversational Spanish",
			"Business Spanish",
			"Grammar",
			"Pronunciation",
			"Cultural Studies",
		],
		experience: "8 years",
		education: "Master's in Spanish Literature, University of Barcelona",
		hourlyRate: 35,
		timezone: "Europe/Madrid",
	});

	const stats = {
		totalStudents: 47,
		totalLessons: 324,
		averageRating: 4.9,
		responseRate: 98,
		completionRate: 96,
	};

	const handleSave = () => {
		// Here you would save the profile data
		setIsEditing(false);
	};

	const handleCancel = () => {
		// Reset any changes
		setIsEditing(false);
	};

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
						Teacher Profile
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
						Manage your profile information and availability
					</p>
				</div>
				<div className="flex items-center gap-2">
					{!isEditing ? (
						<Button onClick={() => setIsEditing(true)} className="gap-2">
							<Edit className="h-4 w-4" />
							Edit Profile
						</Button>
					) : (
						<div className="flex gap-2">
							<Button onClick={handleSave} className="gap-2">
								<Save className="h-4 w-4" />
								Save Changes
							</Button>
							<Button
								onClick={handleCancel}
								variant="outline"
								className="gap-2 bg-transparent">
								<X className="h-4 w-4" />
								Cancel
							</Button>
						</div>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
				{/* Left Column - Profile Info */}
				<div className="lg:col-span-2 space-y-6 sm:space-y-8">
					{/* Basic Information */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle className="dark:text-gray-100">
								Basic Information
							</CardTitle>
							<CardDescription className="dark:text-gray-400">
								Your personal and contact information
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Profile Picture */}
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
								<div className="relative">
									<Avatar className="h-20 w-20 sm:h-24 sm:w-24">
										<AvatarImage src="/placeholder.svg?height=96&width=96" />
										<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-2xl">
											SM
										</AvatarFallback>
									</Avatar>
									{isEditing && (
										<Button
											size="sm"
											className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
											<Camera className="h-4 w-4" />
										</Button>
									)}
								</div>
								<div className="flex-1 space-y-2">
									<div>
										<Label htmlFor="name" className="dark:text-gray-200">
											Full Name
										</Label>
										<Input
											id="name"
											value={profileData.name}
											onChange={(e) =>
												setProfileData((prev) => ({
													...prev,
													name: e.target.value,
												}))
											}
											disabled={!isEditing}
											className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
										/>
									</div>
								</div>
							</div>

							{/* Contact Information */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="email" className="dark:text-gray-200">
										Email
									</Label>
									<Input
										id="email"
										type="email"
										value={profileData.email}
										onChange={(e) =>
											setProfileData((prev) => ({
												...prev,
												email: e.target.value,
											}))
										}
										disabled={!isEditing}
										className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									/>
								</div>
								<div>
									<Label htmlFor="phone" className="dark:text-gray-200">
										Phone
									</Label>
									<Input
										id="phone"
										value={profileData.phone}
										onChange={(e) =>
											setProfileData((prev) => ({
												...prev,
												phone: e.target.value,
											}))
										}
										disabled={!isEditing}
										className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="location" className="dark:text-gray-200">
										Location
									</Label>
									<Input
										id="location"
										value={profileData.location}
										onChange={(e) =>
											setProfileData((prev) => ({
												...prev,
												location: e.target.value,
											}))
										}
										disabled={!isEditing}
										className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									/>
								</div>
								<div>
									<Label htmlFor="timezone" className="dark:text-gray-200">
										Timezone
									</Label>
									<Select
										value={profileData.timezone}
										onValueChange={(value) =>
											setProfileData((prev) => ({ ...prev, timezone: value }))
										}
										disabled={!isEditing}>
										<SelectTrigger className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="dark:bg-gray-700 dark:border-gray-600">
											<SelectItem value="Europe/Madrid">
												Europe/Madrid (GMT+1)
											</SelectItem>
											<SelectItem value="America/New_York">
												America/New_York (GMT-5)
											</SelectItem>
											<SelectItem value="America/Los_Angeles">
												America/Los_Angeles (GMT-8)
											</SelectItem>
											<SelectItem value="Asia/Tokyo">
												Asia/Tokyo (GMT+9)
											</SelectItem>
											<SelectItem value="Australia/Sydney">
												Australia/Sydney (GMT+11)
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div>
								<Label htmlFor="bio" className="dark:text-gray-200">
									Bio
								</Label>
								<Textarea
									id="bio"
									value={profileData.bio}
									onChange={(e) =>
										setProfileData((prev) => ({
											...prev,
											bio: e.target.value,
										}))
									}
									disabled={!isEditing}
									rows={4}
									className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Professional Information */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle className="dark:text-gray-100">
								Professional Information
							</CardTitle>
							<CardDescription className="dark:text-gray-400">
								Your teaching experience and qualifications
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="experience" className="dark:text-gray-200">
										Teaching Experience
									</Label>
									<Input
										id="experience"
										value={profileData.experience}
										onChange={(e) =>
											setProfileData((prev) => ({
												...prev,
												experience: e.target.value,
											}))
										}
										disabled={!isEditing}
										className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									/>
								</div>
								<div>
									<Label htmlFor="hourlyRate" className="dark:text-gray-200">
										Hourly Rate (USD)
									</Label>
									<Input
										id="hourlyRate"
										type="number"
										value={profileData.hourlyRate}
										onChange={(e) =>
											setProfileData((prev) => ({
												...prev,
												hourlyRate: Number.parseInt(e.target.value),
											}))
										}
										disabled={!isEditing}
										className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="education" className="dark:text-gray-200">
									Education
								</Label>
								<Input
									id="education"
									value={profileData.education}
									onChange={(e) =>
										setProfileData((prev) => ({
											...prev,
											education: e.target.value,
										}))
									}
									disabled={!isEditing}
									className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								/>
							</div>

							<div>
								<Label className="dark:text-gray-200">Languages</Label>
								<div className="flex flex-wrap gap-2 mt-2">
									{profileData.languages.map((language, index) => (
										<Badge
											key={index}
											variant="secondary"
											className="dark:bg-gray-700 dark:text-gray-300">
											{language}
										</Badge>
									))}
									{isEditing && (
										<Button
											variant="outline"
											size="sm"
											className="h-6 bg-transparent">
											+ Add Language
										</Button>
									)}
								</div>
							</div>

							<div>
								<Label className="dark:text-gray-200">Specialties</Label>
								<div className="flex flex-wrap gap-2 mt-2">
									{profileData.specialties.map((specialty, index) => (
										<Badge
											key={index}
											variant="outline"
											className="dark:border-gray-600 dark:text-gray-300">
											{specialty}
										</Badge>
									))}
									{isEditing && (
										<Button
											variant="outline"
											size="sm"
											className="h-6 bg-transparent">
											+ Add Specialty
										</Button>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Stats & Quick Info */}
				<div className="space-y-6 sm:space-y-8">
					{/* Teaching Stats */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle className="dark:text-gray-100">
								Teaching Stats
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Total Students
								</span>
								<span className="font-medium text-gray-900 dark:text-gray-100">
									{stats.totalStudents}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Total Lessons
								</span>
								<span className="font-medium text-gray-900 dark:text-gray-100">
									{stats.totalLessons}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Average Rating
								</span>
								<div className="flex items-center gap-1">
									<Star className="h-4 w-4 text-yellow-400 fill-current" />
									<span className="font-medium text-gray-900 dark:text-gray-100">
										{stats.averageRating}
									</span>
								</div>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Response Rate
								</span>
								<span className="font-medium text-gray-900 dark:text-gray-100">
									{stats.responseRate}%
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Completion Rate
								</span>
								<span className="font-medium text-gray-900 dark:text-gray-100">
									{stats.completionRate}%
								</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
