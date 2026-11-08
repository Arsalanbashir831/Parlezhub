'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/contexts/auth-context';

import { forgotPasswordSchema, type ForgotPasswordFormData } from './schemas';
import { useCurrentApp } from './use-current-app';

export function useForgotPassword() {
  const { forgotPassword, isLoading, error } = useAuth();
  const { routes } = useCurrentApp();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await forgotPassword(data.email);
  });

  return {
    form,
    onSubmit,
    isLoading,
    error,
    /** The reset email was requested (shown whether or not the account exists). */
    sent: form.formState.isSubmitSuccessful,
    routes,
  };
}
