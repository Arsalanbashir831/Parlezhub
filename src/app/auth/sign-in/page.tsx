'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Separator } from '@/components/ui/separator';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processingLink, setProcessingLink] = useState(false);

  const hashParams = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const raw = window.location.hash || '';
    if (!raw) return null;
    return new URLSearchParams(raw.startsWith('#') ? raw.slice(1) : raw);
  }, []);

  useEffect(() => {
    // Client-side guard: only redirect once roles are confirmed loaded.
    // isAuthenticated becomes true immediately on SIGNED_IN before refreshUserProfile
    // completes, so guarding on userRoles.length prevents a premature redirect
    // to "/" while the middleware still sees no user_roles cookie.
    if (isAuthenticated && userRoles.length > 0) {
      const redirectTo = searchParams?.get('redirect');
      if (typeof window !== 'undefined') {
        window.location.replace(redirectTo || '/');
      }
      return;
    }

    const processHashLogin = async () => {
      if (!hashParams) return;
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (!accessToken || !refreshToken) return;

      try {
        setProcessingLink(true);
        // The auth context will handle profile fetching and role determination automatically
        // No need to manually fetch profiles here
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch { }

        // The auth context will handle profile fetching and role determination automatically
        // No need to manually fetch profiles here

        toast.success('Signed in successfully');

        const redirectTo = searchParams?.get('redirect');
        if (typeof window !== 'undefined') {
          if (redirectTo) {
            window.location.replace(redirectTo);
          } else {
            // Let the auth context handle the redirection based on user roles
            window.location.replace('/');
          }
        }
      } catch {
        // If anything fails, stay on sign-in and show a message
        toast.error('Sign-in link processing failed. Please sign in manually.');
        setProcessingLink(false);
      }
    };

    void processHashLogin();
  }, [hashParams, router, isAuthenticated, userRoles, searchParams]);

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

  if (processingLink) {
    return (
      <AuthLayout title="Signing you in..." subtitle="Please wait">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Redirecting to your dashboard
        </div>
      </AuthLayout>
    );
  }

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

        <div className="flex items-center justify-center gap-2">
          <Separator
            orientation="horizontal"
            className="w-full bg-primary-100"
          />
          <p className="px-2 text-primary-100">OR</p>
          <Separator
            orientation="horizontal"
            className="w-full bg-primary-100"
          />
        </div>

        <GoogleOAuthButton
          disabled={isLoading}
          className="w-full"
        />

        <div className="text-center">
          <p className="text-sm text-primary-100">
            Don&apos;t have an account?{' '}
            <Link
              href={ROUTES.AUTH.SIGNUP}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Forgot your password?
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
