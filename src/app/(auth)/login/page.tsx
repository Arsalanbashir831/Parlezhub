"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginForm) => {
		setIsLoading(true);
		try {
			await login(data.email, data.password);
			router.push(ROUTES.STUDENT.DASHBOARD);
		} catch (error) {
			setError("root", {
				message: "Invalid email or password. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthLayout
			title="Welcome Back"
			subtitle="Sign in to continue your language learning journey">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<div className="space-y-4">
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

					<div>
						<Label htmlFor="password">Password</Label>
						<div className="relative mt-1">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="Enter your password"
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
				</div>

				{errors.root && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-3">
						<p className="text-sm text-red-600">{errors.root.message}</p>
					</div>
				)}

				<div className="flex items-center justify-between">
					<Link
						href="/forgot-password"
						className="text-sm text-primary-600 hover:text-primary-500 font-medium">
						Forgot password?
					</Link>
				</div>

				<Button
					type="submit"
					className="w-full bg-primary-500 hover:bg-primary-600"
					disabled={isLoading}>
					{isLoading ? "Signing in..." : "Sign In"}
				</Button>

				<div className="text-center">
					<p className="text-sm text-gray-600">
						Don't have an account?{" "}
						<Link
							href="/signup"
							className="text-primary-600 hover:text-primary-500 font-medium">
							Sign up
						</Link>
					</p>
				</div>
			</form>
		</AuthLayout>
	);
}
