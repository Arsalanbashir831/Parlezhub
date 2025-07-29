"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { InfoMessage, SuccessMessage } from "@/components/auth/status-messages";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/contexts/auth-context";

export default function VerifyEmailPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [resendCount, setResendCount] = useState(0);
	const searchParams = useSearchParams();
	const email = searchParams.get("email");
	const { forgotPassword } = useAuth();

	const handleResendEmail = async () => {
		if (!email) return;

		setIsLoading(true);
		try {
			await forgotPassword(email);
			setResendCount((prev) => prev + 1);
		} catch (error) {
			console.error("Failed to resend email:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthLayout
			title="Verify Your Email"
			subtitle="We've sent a verification link to your email address">
			<div className="text-center space-y-6">
				<div className="flex justify-center">
					<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
						<Mail className="w-8 h-8 text-primary-600" />
					</div>
				</div>

				<div>
					<p className="text-gray-600 mb-4">
						Please check your email and click the verification link to activate
						your account.
					</p>
					{email && (
						<p className="font-medium text-gray-900 bg-gray-50 rounded-lg p-3">
							{email}
						</p>
					)}
				</div>

				<InfoMessage 
					message={
						<>
							<strong>Didn't receive the email?</strong>
							<br />
							Check your spam folder or click the resend button below.
						</>
					}
				/>

				{resendCount > 0 && (
					<SuccessMessage 
						message="Verification email sent successfully!"
						icon={CheckCircle}
					/>
				)}

				<div className="space-y-3">
					<AuthButton
						type="button"
						variant="outline"
						isLoading={isLoading}
						disabled={!email}
						loadingText="Sending..."
						icon={isLoading ? RefreshCw : undefined}
						onClick={handleResendEmail}
						className="w-full bg-transparent">
						{isLoading ? "Sending..." : "Resend Verification Email"}
					</AuthButton>

					<Link href="/login">
						<AuthButton
							type="button"
							variant="ghost">
							Back to Sign In
						</AuthButton>
					</Link>
				</div>

				<div className="text-xs text-gray-500">
					<p>
						Having trouble? Contact our support team at{" "}
						<a
							href="mailto:support@linkguaflex.com"
							className="text-primary-600 hover:underline">
							support@linkguaflex.com
						</a>
					</p>
				</div>
			</div>
		</AuthLayout>
	);
}
