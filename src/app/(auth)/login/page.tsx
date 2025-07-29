'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthLayout } from '@/components/auth/auth-layout';
import { EmailField, PasswordField } from '@/components/auth/specialized-fields';
import { ErrorMessage } from '@/components/auth/status-messages';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';

const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const { login, isLoading, error } = useAuth();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormData) => {
		const success = await login(data.email, data.password);
		if (success) {
			router.push(ROUTES.STUDENT.DASHBOARD);
		}
	};

	return (
		<AuthLayout
			title="Welcome back"
			subtitle="Sign in to your account to continue"
		>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<EmailField register={register('email')} error={errors.email} />

				<PasswordField register={register('password')} error={errors.password} />

				{error && <ErrorMessage message={error} />}

				<AuthButton type="submit" isLoading={isLoading}>
					Sign In
				</AuthButton>

				<div className="text-center">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Don&apos;t have an account?{' '}
						<Link
							href={ROUTES.AUTH.SIGNUP}
							className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Sign up
						</Link>
					</p>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						<Link
							href={ROUTES.AUTH.FORGOT_PASSWORD}
							className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Forgot your password?
						</Link>
					</p>
				</div>
			</form>
		</AuthLayout>
	);
}
