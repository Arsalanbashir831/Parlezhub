"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { EmailField } from "@/components/auth/form-fields";
import { ErrorMessage, InfoMessage } from "@/components/auth/status-messages";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/contexts/auth-context";

const forgotPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const { forgotPassword } = useAuth();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
		getValues,
	} = useForm<ForgotPasswordForm>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = async (data: ForgotPasswordForm) => {
		setIsLoading(true);
		try {
			await forgotPassword(data.email);
			setIsSuccess(true);
		} catch (error) {
			setError("root", {
				message: "Failed to send reset email. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<AuthLayout
				title="Check Your Email"
				subtitle="We've sent password reset instructions to your email">
				<div className="text-center space-y-6">
					<div className="flex justify-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
							<CheckCircle className="w-8 h-8 text-green-600" />
						</div>
					</div>

					<div>
						<p className="text-gray-600 mb-4">
							We've sent a password reset link to:
						</p>
						<p className="font-medium text-gray-900">{getValues("email")}</p>
					</div>

					<InfoMessage message="Didn't receive the email? Check your spam folder or try again in a few minutes." />

					<div className="space-y-3">
						<AuthButton
							type="button"
							variant="outline"
							onClick={() => setIsSuccess(false)}>
							Try Different Email
						</AuthButton>

						<Link href="/login">
							<AuthButton
								type="button"
								variant="ghost"
								icon={ArrowLeft}>
								Back to Sign In
							</AuthButton>
						</Link>
					</div>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout
			title="Forgot Password"
			subtitle="Enter your email address and we'll send you a reset link">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<EmailField
					register={register("email")}
					error={errors.email}
				/>

				{errors.root && <ErrorMessage message={errors.root.message || ""} />}

				<AuthButton
					isLoading={isLoading}
					loadingText="Sending...">
					Send Reset Link
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
