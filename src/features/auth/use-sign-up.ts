'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/contexts/auth-context';

import { signupSchema, type SignupFormData } from './schemas';
import { useCurrentApp } from './use-current-app';

export function useSignUp() {
  const { signup, isLoading, error, isAuthenticated } = useAuth();
  const { routes } = useCurrentApp();
  const router = useRouter();

  // Already signed in: this screen has nothing to offer.
  useEffect(() => {
    if (isAuthenticated) router.replace(routes.home);
  }, [isAuthenticated, router, routes.home]);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { full_name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await signup({ username: data.full_name, email: data.email }, data.password);
  });

  return {
    form,
    onSubmit,
    isLoading,
    error,
    /** True while an authenticated visitor is being sent home; render nothing. */
    redirecting: isAuthenticated,
    routes,
  };
}
