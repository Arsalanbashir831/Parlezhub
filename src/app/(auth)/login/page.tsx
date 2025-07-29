"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AuthLayout } from "@/components/auth/auth-layout";
import { EmailField, PasswordField } from "@/components/auth/form-fields";
import { ErrorMessage } from "@/components/auth/status-messages";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/contexts/auth-context";
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
					<EmailField
						register={register("email")}
						error={errors.email}
					/>

					<PasswordField
						register={register("password")}
						error={errors.password}
						showPassword={showPassword}
						setShowPassword={setShowPassword}
					/>
				</div>

				{errors.root && <ErrorMessage message={errors.root.message || ""} />}

				<div className="flex items-center justify-between">
					<Link
						href="/forgot-password"
						className="text-sm text-primary-600 hover:text-primary-500 font-medium">
						Forgot password?
					</Link>
				</div>

				<AuthButton
					isLoading={isLoading}
					loadingText="Signing in...">
					Sign In
				</AuthButton>

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
