"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
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

				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<p className="text-sm text-blue-800">
						<strong>Didn't receive the email?</strong>
						<br />
						Check your spam folder or click the resend button below.
					</p>
				</div>

				{resendCount > 0 && (
					<div className="bg-green-50 border border-green-200 rounded-lg p-3">
						<div className="flex items-center justify-center text-green-800">
							<CheckCircle className="w-4 h-4 mr-2" />
							<span className="text-sm">
								Verification email sent successfully!
							</span>
						</div>
					</div>
				)}

				<div className="space-y-3">
					<Button
						onClick={handleResendEmail}
						disabled={isLoading || !email}
						variant="outline"
						className="w-full bg-transparent">
						{isLoading ? (
							<>
								<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
								Sending...
							</>
						) : (
							"Resend Verification Email"
						)}
					</Button>

					<Link href="/login">
						<Button variant="ghost" className="w-full">
							Back to Sign In
						</Button>
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
