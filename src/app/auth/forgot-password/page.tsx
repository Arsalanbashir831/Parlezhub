'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthLayout } from '@/components/auth/auth-layout';
import { EmailField } from '@/components/auth/specialized-fields';
import { ErrorMessage, InfoMessage } from '@/components/auth/status-messages';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await forgotPassword(data.email);
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      {isSubmitSuccessful ? (
        <div className="space-y-6">
          <InfoMessage message="If an account with that email exists, we've sent you a password reset link." />
          <div className="text-center">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <EmailField
            placeholder="Enter your email address"
            register={register('email')}
            error={errors.email}
          />

          {error && <ErrorMessage message={error} />}

          <AuthButton type="submit" isLoading={isLoading}>
            Send Reset Link
          </AuthButton>

          <div className="text-center">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
