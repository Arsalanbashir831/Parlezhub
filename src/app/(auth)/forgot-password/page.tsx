"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

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

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<p className="text-sm text-blue-800">
							Didn't receive the email? Check your spam folder or try again in a
							few minutes.
						</p>
					</div>

					<div className="space-y-3">
						<Button
							onClick={() => setIsSuccess(false)}
							variant="outline"
							className="w-full">
							Try Different Email
						</Button>

						<Link href="/login">
							<Button variant="ghost" className="w-full">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Sign In
							</Button>
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
						<p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
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
					{isLoading ? "Sending..." : "Send Reset Link"}
				</Button>

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
