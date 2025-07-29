"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AuthLayout } from "@/components/auth/auth-layout";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
	EmailField,
	PasswordField,
	ConfirmPasswordField,
	NameField,
} from "@/components/auth/form-fields";
import { ErrorMessage } from "@/components/auth/status-messages";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/lib/types";
import { ROUTES } from "@/constants/routes";

const signupSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
		role: z.enum(["student", "teacher"] as const),
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

					<NameField
						id="name"
						register={register("name")}
						error={errors.name}
					/>

					<EmailField
						register={register("email")}
						error={errors.email}
					/>

					<PasswordField
						placeholder="Create a password"
						register={register("password")}
						error={errors.password}
						showPassword={showPassword}
						setShowPassword={setShowPassword}
					/>

					<ConfirmPasswordField
						register={register("confirmPassword")}
						error={errors.confirmPassword}
						showPassword={showConfirmPassword}
						setShowPassword={setShowConfirmPassword}
					/>
				</div>

				{errors.root && <ErrorMessage message={errors.root.message} />}

				<AuthButton
					isLoading={isLoading}
					loadingText="Creating Account...">
					Create Account
				</AuthButton>

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
