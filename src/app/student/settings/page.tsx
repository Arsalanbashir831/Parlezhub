"use client";

import { useState } from "react";
import { User, Bell, Shield, Eye, EyeOff } from "lucide-react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";

export default function SettingsPage() {
	const { user } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Profile Settings
	const [profileData, setProfileData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		bio: "",
		city: user?.city || "",
		country: user?.country || "",
		timezone: "UTC-5",
		language: "English",
	});

	// Notification Settings
	const [notifications, setNotifications] = useState({
		emailNotifications: true,
		pushNotifications: true,
		sessionReminders: true,
		weeklyReports: true,
		teacherMessages: true,
		marketingEmails: false,
	});

	// Security Settings
	const [security, setSecurity] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
		twoFactorEnabled: false,
	});

	const handleSaveProfile = async () => {
		setIsLoading(true);
		try {
			// API call to update profile
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Profile updated:", profileData);
		} catch (error) {
			console.error("Failed to update profile:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSaveNotifications = async () => {
		setIsLoading(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Notifications updated:", notifications);
		} catch (error) {
			console.error("Failed to update notifications:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSaveSecurity = async () => {
		setIsLoading(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Security updated:", security);
		} catch (error) {
			console.error("Failed to update security:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
					Settings
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-2">
					Manage your account settings and preferences
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Profile Settings */}
				<div className="lg:col-span-2 space-y-8">
					{/* Profile Information */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<div className="flex items-center gap-2">
								<User className="h-5 w-5 text-primary-600" />
								<CardTitle className="dark:text-gray-100">
									Profile Information
								</CardTitle>
							</div>
							<CardDescription className="dark:text-gray-400">
								Update your personal information and profile details
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Avatar Upload */}
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
								<Avatar className="h-20 w-20">
									<AvatarImage src={user?.avatar || "/placeholder.svg"} />
									<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-2xl">
										{user?.name?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="space-y-2">
									<Button variant="outline" size="sm">
										Change Avatar
									</Button>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										JPG, PNG or GIF. Max size 2MB.
									</p>
								</div>
							</div>

							<Separator className="dark:bg-gray-700" />

							{/* Form Fields */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="name" className="dark:text-gray-200">
										Full Name
									</Label>
									<Input
										id="name"
										value={profileData.name}
										onChange={(e) =>
											setProfileData({ ...profileData, name: e.target.value })
										}
										placeholder="Enter your full name"
										className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email" className="dark:text-gray-200">
										Email Address
									</Label>
									<Input
										id="email"
										type="email"
										value={profileData.email}
										onChange={(e) =>
											setProfileData({
												...profileData,
												email: e.target.value,
											})
										}
										placeholder="Enter your email"
										className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="bio" className="dark:text-gray-200">
									Bio
								</Label>
								<Textarea
									id="bio"
									value={profileData.bio}
									onChange={(e) =>
										setProfileData({ ...profileData, bio: e.target.value })
									}
									placeholder="Tell us about yourself..."
									rows={3}
									className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="city" className="dark:text-gray-200">
										City
									</Label>
									<Input
										id="city"
										value={profileData.city}
										onChange={(e) =>
											setProfileData({ ...profileData, city: e.target.value })
										}
										placeholder="Your city"
										className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="country" className="dark:text-gray-200">
										Country
									</Label>
									<Input
										id="country"
										value={profileData.country}
										onChange={(e) =>
											setProfileData({
												...profileData,
												country: e.target.value,
											})
										}
										placeholder="Your country"
										className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="timezone" className="dark:text-gray-200">
										Timezone
									</Label>
									<Select
										value={profileData.timezone}
										onValueChange={(value) =>
											setProfileData({ ...profileData, timezone: value })
										}>
										<SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
											<SelectValue placeholder="Select timezone" />
										</SelectTrigger>
										<SelectContent className="dark:bg-gray-700 dark:border-gray-600">
											<SelectItem value="UTC-12">
												UTC-12 (Baker Island)
											</SelectItem>
											<SelectItem value="UTC-8">UTC-8 (PST)</SelectItem>
											<SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
											<SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
											<SelectItem value="UTC+1">UTC+1 (CET)</SelectItem>
											<SelectItem value="UTC+8">UTC+8 (CST)</SelectItem>
											<SelectItem value="UTC+9">UTC+9 (JST)</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="language" className="dark:text-gray-200">
										Preferred Language
									</Label>
									<Select
										value={profileData.language}
										onValueChange={(value) =>
											setProfileData({ ...profileData, language: value })
										}>
										<SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
											<SelectValue placeholder="Select language" />
										</SelectTrigger>
										<SelectContent className="dark:bg-gray-700 dark:border-gray-600">
											<SelectItem value="English">English</SelectItem>
											<SelectItem value="Spanish">Español</SelectItem>
											<SelectItem value="French">Français</SelectItem>
											<SelectItem value="German">Deutsch</SelectItem>
											<SelectItem value="Italian">Italiano</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="flex justify-end">
								<Button
									onClick={handleSaveProfile}
									disabled={isLoading}
									className="bg-primary-500 hover:bg-primary-600">
									{isLoading ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Security Settings */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Shield className="h-5 w-5 text-primary-600" />
								<CardTitle className="dark:text-gray-100">Security</CardTitle>
							</div>
							<CardDescription className="dark:text-gray-400">
								Manage your password and security preferences
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label
										htmlFor="currentPassword"
										className="dark:text-gray-200">
										Current Password
									</Label>
									<div className="relative">
										<Input
											id="currentPassword"
											type={showPassword ? "text" : "password"}
											value={security.currentPassword}
											onChange={(e) =>
												setSecurity({
													...security,
													currentPassword: e.target.value,
												})
											}
											placeholder="Enter current password"
											className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowPassword(!showPassword)}>
											{showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="newPassword" className="dark:text-gray-200">
											New Password
										</Label>
										<Input
											id="newPassword"
											type="password"
											value={security.newPassword}
											onChange={(e) =>
												setSecurity({
													...security,
													newPassword: e.target.value,
												})
											}
											placeholder="Enter new password"
											className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="confirmPassword"
											className="dark:text-gray-200">
											Confirm Password
										</Label>
										<Input
											id="confirmPassword"
											type="password"
											value={security.confirmPassword}
											onChange={(e) =>
												setSecurity({
													...security,
													confirmPassword: e.target.value,
												})
											}
											placeholder="Confirm new password"
											className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
										/>
									</div>
								</div>
							</div>

							<Separator className="dark:bg-gray-700" />

							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<Label className="dark:text-gray-200">
										Two-Factor Authentication
									</Label>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Add an extra layer of security to your account
									</p>
								</div>
								<Switch
									checked={security.twoFactorEnabled}
									onCheckedChange={(checked) =>
										setSecurity({ ...security, twoFactorEnabled: checked })
									}
								/>
							</div>

							<div className="flex justify-end">
								<Button
									onClick={handleSaveSecurity}
									disabled={isLoading}
									className="bg-primary-500 hover:bg-primary-600">
									{isLoading ? "Saving..." : "Update Security"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Account Status & Notifications */}
				<div className="space-y-8">
					{/* Account Status */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle className="text-lg dark:text-gray-100">
								Account Status
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium dark:text-gray-200">
									Account Type
								</span>
								<Badge variant="secondary">Student</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium dark:text-gray-200">
									Verification
								</span>
								<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
									Verified
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium dark:text-gray-200">
									Member Since
								</span>
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Jan 2024
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Notifications */}
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Bell className="h-5 w-5 text-primary-600" />
								<CardTitle className="text-lg dark:text-gray-100">
									Notifications
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<Label className="text-sm font-medium dark:text-gray-200">
										Email Notifications
									</Label>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Receive updates via email
									</p>
								</div>
								<Switch
									checked={notifications.emailNotifications}
									onCheckedChange={(checked) =>
										setNotifications({
											...notifications,
											emailNotifications: checked,
										})
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<Label className="text-sm font-medium dark:text-gray-200">
										Push Notifications
									</Label>
									<p className="text-xs text-gray-400">Browser notifications</p>
								</div>
								<Switch
									checked={notifications.pushNotifications}
									onCheckedChange={(checked) =>
										setNotifications({
											...notifications,
											pushNotifications: checked,
										})
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<Label className="text-sm font-medium dark:text-gray-200">
										Session Reminders
									</Label>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Reminders for scheduled sessions
									</p>
								</div>
								<Switch
									checked={notifications.sessionReminders}
									onCheckedChange={(checked) =>
										setNotifications({
											...notifications,
											sessionReminders: checked,
										})
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<Label className="text-sm font-medium dark:text-gray-200">
										Weekly Reports
									</Label>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Progress summaries
									</p>
								</div>
								<Switch
									checked={notifications.weeklyReports}
									onCheckedChange={(checked) =>
										setNotifications({
											...notifications,
											weeklyReports: checked,
										})
									}
								/>
							</div>

							<div className="flex justify-end pt-2">
								<Button
									onClick={handleSaveNotifications}
									size="sm"
									variant="outline">
									Save
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
