'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthLayout } from '@/components/auth/auth-layout';
import { ConfirmPasswordField, EmailField, NameField, PasswordField } from '@/components/auth/specialized-fields';
import { ErrorMessage } from '@/components/auth/status-messages';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';

const signupSchema = z
  .object({
    username: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signup, isLoading, error } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    await signup({ username: data.username, email: data.email }, data.password);
    router.push(ROUTES.AUTH.VERIFY_EMAIL);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of learners on their language journey"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <NameField register={register('username')} error={errors.username} />

        <EmailField register={register('email')} error={errors.email} />

        <PasswordField register={register('password')} error={errors.password} />

        <ConfirmPasswordField
          register={register('confirmPassword')}
          error={errors.confirmPassword}
        />

        {error && <ErrorMessage message={error} />}

        <AuthButton type="submit" isLoading={isLoading}>
          Create Account
        </AuthButton>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
