'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/contexts/auth-context';

import { loginSchema, type LoginFormData } from './schemas';
import { useCurrentApp } from './use-current-app';

export function useSignIn() {
  const { login, isLoading, isAuthenticated, userRoles } = useAuth();
  const { routes } = useCurrentApp();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Guard once the session call has resolved: userRoles stays empty until the
    // server confirms them, so this can't bounce before middleware agrees.
    if (isAuthenticated && userRoles.length > 0) {
      window.location.replace(searchParams?.get('redirect') || routes.home);
    }
  }, [isAuthenticated, userRoles, searchParams, routes.home]);

  const form = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = form.handleSubmit(async (data) => {
    await login(data.email, data.password);
  });

  return { form, onSubmit, isLoading, routes };
}
