'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { userApi } from '@/services/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { setCookie } from '@/lib/cookie-utils';
import { AuthLayout } from '@/components/auth/auth-layout';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
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
      if (typeof window !== 'undefined') {
        window.location.replace('/');
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

        if (typeof window !== 'undefined') {
          if (role === 'STUDENT') {
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
}
