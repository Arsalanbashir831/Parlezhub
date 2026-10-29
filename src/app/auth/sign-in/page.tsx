'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthLayout } from '@/components/auth/auth-layout';
import { GoogleOAuthButton } from '@/components/auth/google-oauth-button';
import {
  EmailField,
  PasswordField,
} from '@/components/auth/specialized-fields';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading, isAuthenticated, userRoles } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Guard once the session call has resolved: userRoles stays empty until the
    // server confirms them, so this can't bounce to "/" before middleware agrees.
    if (isAuthenticated && userRoles.length > 0) {
      window.location.replace(searchParams?.get('redirect') || '/');
    }
  }, [isAuthenticated, userRoles, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <EmailField register={register('email')} error={errors.email} />

        <PasswordField
          register={register('password')}
          error={errors.password}
        />

        <AuthButton type="submit" isLoading={isLoading}>
          Sign In
        </AuthButton>

        <div className="flex items-center gap-3">
          <span className="hairline h-px flex-1" />
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            or
          </p>
          <span className="hairline h-px flex-1" />
        </div>

        <GoogleOAuthButton
          disabled={isLoading}
          className="w-full"
        />

        <div className="text-center">
          <p className="text-sm text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link
              href={ROUTES.AUTH.SIGNUP}
              className="font-medium text-ember transition-colors hover:text-ember-soft"
            >
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="font-medium text-ember transition-colors hover:text-ember-soft"
            >
              Forgot your password?
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
