"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, MapPin, Globe } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { ROUTES } from "@/constants/routes";

const signupSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
		role: z.enum(["student", "teacher"] as const),
		city: z.string().min(2, "City is required"),
		country: z.string().min(2, "Country is required"),
		postalCode: z.string().min(3, "Postal code is required"),
		address: z.string().min(10, "Please enter a complete address"),
		qualification: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})
	.refine(
		(data) => {
			if (data.role === "teacher") {
				return data.qualification && data.qualification.length >= 10;
			}
			return true;
		},
		{
			message: "Qualification is required for teachers (minimum 10 characters)",
			path: ["qualification"],
		}
	);

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { signup } = useAuth();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
		setError,
	} = useForm<SignupForm>({
		resolver: zodResolver(signupSchema),
	});

	const selectedRole = watch("role");

	const onSubmit = async (data: SignupForm) => {
		setIsLoading(true);
		try {
			const { confirmPassword, ...userData } = data;
			await signup(userData, data.password);
			router.push(
				ROUTES.AUTH.VERIFY_EMAIL + "?email=" + encodeURIComponent(data.email)
			);
		} catch (error) {
			setError("root", {
				message: "Failed to create account. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthLayout
			title="Create Account"
			subtitle="Join LinkguaFlex and start your language learning journey">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<div className="space-y-4">
					{/* Role Selection */}
					<div>
						<Label htmlFor="role">I am a</Label>
						<Select
							onValueChange={(value: UserRole) => setValue("role", value)}>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select your role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="student">Student</SelectItem>
								<SelectItem value="teacher">Teacher</SelectItem>
							</SelectContent>
						</Select>
						{errors.role && (
							<p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
						)}
					</div>

					{/* Name */}
					<div>
						<Label htmlFor="name">Full Name</Label>
						<div className="relative mt-1">
							<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								id="name"
								type="text"
								placeholder="Enter your full name"
								className={cn(
									"pl-10",
									errors.name && "border-red-500 focus:border-red-500"
								)}
								{...register("name")}
							/>
						</div>
						{errors.name && (
							<p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
						)}
					</div>

					{/* Email */}
					<div>
						<Label htmlFor="email">Email Address</Label>
						<div className="relative mt-1">
							<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								className={cn(
									"pl-10",
									errors.email && "border-red-500 focus:border-red-500"
								)}
								{...register("email")}
							/>
						</div>
						{errors.email && (
							<p className="text-sm text-red-600 mt-1">
								{errors.email.message}
							</p>
						)}
					</div>

					{/* Password */}
					<div>
						<Label htmlFor="password">Password</Label>
						<div className="relative mt-1">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="Create a password"
								className={cn(
									"pl-10 pr-10",
									errors.password && "border-red-500 focus:border-red-500"
								)}
								{...register("password")}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						{errors.password && (
							<p className="text-sm text-red-600 mt-1">
								{errors.password.message}
							</p>
						)}
					</div>

					{/* Confirm Password */}
					<div>
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<div className="relative mt-1">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								id="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Confirm your password"
								className={cn(
									"pl-10 pr-10",
									errors.confirmPassword &&
										"border-red-500 focus:border-red-500"
								)}
								{...register("confirmPassword")}
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
								{showConfirmPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						{errors.confirmPassword && (
							<p className="text-sm text-red-600 mt-1">
								{errors.confirmPassword.message}
							</p>
						)}
					</div>

					{/* Location Fields */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="city">City</Label>
							<div className="relative mt-1">
								<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									id="city"
									type="text"
									placeholder="Your city"
									className={cn(
										"pl-10",
										errors.city && "border-red-500 focus:border-red-500"
									)}
									{...register("city")}
								/>
							</div>
							{errors.city && (
								<p className="text-sm text-red-600 mt-1">
									{errors.city.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="country">Country</Label>
							<div className="relative mt-1">
								<Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									id="country"
									type="text"
									placeholder="Your country"
									className={cn(
										"pl-10",
										errors.country && "border-red-500 focus:border-red-500"
									)}
									{...register("country")}
								/>
							</div>
							{errors.country && (
								<p className="text-sm text-red-600 mt-1">
									{errors.country.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<Label htmlFor="postalCode">Postal Code</Label>
						<Input
							id="postalCode"
							type="text"
							placeholder="Enter postal code"
							className={cn(
								"mt-1",
								errors.postalCode && "border-red-500 focus:border-red-500"
							)}
							{...register("postalCode")}
						/>
						{errors.postalCode && (
							<p className="text-sm text-red-600 mt-1">
								{errors.postalCode.message}
							</p>
						)}
					</div>

					<div>
						<Label htmlFor="address">Address</Label>
						<Textarea
							id="address"
							placeholder="Enter your complete address"
							className={cn(
								"mt-1",
								errors.address && "border-red-500 focus:border-red-500"
							)}
							{...register("address")}
						/>
						{errors.address && (
							<p className="text-sm text-red-600 mt-1">
								{errors.address.message}
							</p>
						)}
					</div>

					{/* Teacher Qualification */}
					{selectedRole === "teacher" && (
						<div>
							<Label htmlFor="qualification">Qualification</Label>
							<Textarea
								id="qualification"
								placeholder="Describe your teaching qualifications, certifications, and experience"
								className={cn(
									"mt-1",
									errors.qualification && "border-red-500 focus:border-red-500"
								)}
								{...register("qualification")}
							/>
							{errors.qualification && (
								<p className="text-sm text-red-600 mt-1">
									{errors.qualification.message}
								</p>
							)}
						</div>
					)}
				</div>

				{errors.root && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-3">
						<p className="text-sm text-red-600">{errors.root.message}</p>
					</div>
				)}

				<Button
					type="submit"
					className="w-full bg-primary-500 hover:bg-primary-600"
					disabled={isLoading}>
					{isLoading ? "Creating Account..." : "Create Account"}
				</Button>

				<div className="text-center">
					<p className="text-sm text-gray-600">
						Already have an account?{" "}
						<Link
							href="/login"
							className="text-primary-600 hover:text-primary-500 font-medium">
							Sign in
						</Link>
					</p>
				</div>
			</form>
		</AuthLayout>
	);
}
