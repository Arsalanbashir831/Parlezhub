"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordField, ConfirmPasswordField } from "@/components/auth/form-fields";
import { ErrorMessage, SuccessMessage, InfoMessage } from "@/components/auth/status-messages";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/contexts/auth-context";

const resetPasswordSchema = z
	.object({
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [tokenError, setTokenError] = useState<string | null>(null);
	const { resetPassword } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<ResetPasswordForm>({
		resolver: zodResolver(resetPasswordSchema),
	});

	// Validate token on component mount
	useEffect(() => {
		if (!token) {
			setTokenError("Invalid or missing reset token. Please request a new password reset link.");
		}
	}, [token]);

	const onSubmit = async (data: ResetPasswordForm) => {
		if (!token) {
			setTokenError("Invalid reset token. Please request a new password reset link.");
			return;
		}

		setIsLoading(true);
		try {
			await resetPassword(token, data.password);
			setIsSuccess(true);
		} catch (error) {
			setError("root", {
				message: "Failed to reset password. The link may have expired. Please request a new reset link.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Show success state
	if (isSuccess) {
		return (
			<AuthLayout
				title="Password Reset Successful"
				subtitle="Your password has been updated successfully">
				<div className="text-center space-y-6">
					<div className="flex justify-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
							<CheckCircle className="w-8 h-8 text-green-600" />
						</div>
					</div>

					<SuccessMessage 
						message="Your password has been successfully reset. You can now sign in with your new password."
					/>

					<Link href="/login" className="block">
						<AuthButton type="button">
							Sign In Now
						</AuthButton>
					</Link>
				</div>
			</AuthLayout>
		);
	}

	// Show token error state
	if (tokenError) {
		return (
			<AuthLayout
				title="Invalid Reset Link"
				subtitle="There was a problem with your password reset link">
				<div className="text-center space-y-6">
					<div className="flex justify-center">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
							<AlertCircle className="w-8 h-8 text-red-600" />
						</div>
					</div>

					<ErrorMessage message={tokenError} />

					<InfoMessage message="Password reset links expire after 24 hours for security reasons. Please request a new reset link." />

					<div className="space-y-6">
						<Link href="/forgot-password" className="block">
							<AuthButton type="button">
								Request New Reset Link
							</AuthButton>
						</Link>

						<Link href="/login" className="block">
							<AuthButton
								type="button"
								variant="ghost"
								className="bg-white w-full"
								icon={ArrowLeft}>
								Back to Sign In
							</AuthButton>
						</Link>
					</div>
				</div>
			</AuthLayout>
		);
	}

	// Show reset password form
	return (
		<AuthLayout
			title="Reset Your Password"
			subtitle="Enter your new password below">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<div className="space-y-4">
					<PasswordField
						placeholder="Enter your new password"
						register={register("password")}
						error={errors.password}
						showPassword={showPassword}
						setShowPassword={setShowPassword}
					/>

					<ConfirmPasswordField
						placeholder="Confirm your new password"
						register={register("confirmPassword")}
						error={errors.confirmPassword}
						showPassword={showConfirmPassword}
						setShowPassword={setShowConfirmPassword}
					/>
				</div>

				{errors.root && <ErrorMessage message={errors.root.message} />}

				<InfoMessage message="Choose a strong password with at least 6 characters for better security." />

				<AuthButton
					isLoading={isLoading}
					loadingText="Resetting Password...">
					Reset Password
				</AuthButton>

				<div className="text-center">
					<Link
						href="/login"
						className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 font-medium">
						<ArrowLeft className="w-4 h-4 mr-1" />
						Back to Sign In
					</Link>
				</div>
			</form>
		</AuthLayout>
	);
} 