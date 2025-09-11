'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { userApi } from '@/services/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { setCookie } from '@/lib/cookie-utils';
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
  const { login, isLoading, isAuthenticated } = useAuth();
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
    // Client-side guard: if already authenticated, bounce to dashboard
    if (isAuthenticated) {
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
        // Persist tokens
        setCookie('access_token', accessToken);
        setCookie('refresh_token', refreshToken);

        // Optionally clear hash from URL to avoid exposing tokens in history
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch {}

        // Fetch profile to get role, then redirect accordingly
        let role: 'STUDENT' | 'TEACHER' = 'STUDENT';
        try {
          const student = await userApi.getStudentProfile();
          role = student.role;
        } catch {
          const teacher = await userApi.getTeacherProfile();
          role = teacher.role;
        }
        setCookie('user_role', role);

        toast.success('Signed in successfully');

        const redirectTo = searchParams?.get('redirect');
        if (typeof window !== 'undefined') {
          if (redirectTo) {
            window.location.replace(redirectTo);
          } else if (role === 'STUDENT') {
            window.location.replace(ROUTES.STUDENT.DASHBOARD);
          } else if (role === 'TEACHER') {
            window.location.replace(ROUTES.TEACHER.DASHBOARD);
          } else {
            window.location.replace('/');
          }
        }
      } catch (e) {
        // If anything fails, stay on sign-in and show a message
        toast.error('Sign-in link processing failed. Please sign in manually.');
        setProcessingLink(false);
      }
    };

    void processHashLogin();
  }, [hashParams, router, isAuthenticated]);

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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleOAuthButton
          mode="login"
          disabled={isLoading}
          className="w-full"
        />

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
