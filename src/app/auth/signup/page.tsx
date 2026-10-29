'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthLayout } from '@/components/auth/auth-layout';
import { GoogleOAuthButton } from '@/components/auth/google-oauth-button';
import {
  ConfirmPasswordField,
  EmailField,
  NameField,
  PasswordField,
} from '@/components/auth/specialized-fields';
import { ErrorMessage } from '@/components/auth/status-messages';

const signupSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
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
  const { signup, isLoading, error, isAuthenticated } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Client-side guard: prevent access if already authenticated
  if (isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.replace('/');
    }
    return null;
  }

  const onSubmit = async (data: SignupFormData) => {
    await signup(
      {
        username: data.full_name,
        email: data.email,
      },
      data.password
    );
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of learners on their language journey"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <NameField register={register('full_name')} error={errors.full_name} />

        <EmailField register={register('email')} error={errors.email} />

        <PasswordField
          register={register('password')}
          error={errors.password}
        />

        <ConfirmPasswordField
          register={register('confirmPassword')}
          error={errors.confirmPassword}
        />


        {error && <ErrorMessage message={error} />}

        <AuthButton type="submit" isLoading={isLoading}>
          Create Account
        </AuthButton>

        <div className="flex items-center gap-3">
          <span className="hairline h-px flex-1" />
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            or
          </p>
          <span className="hairline h-px flex-1" />
        </div>

        <GoogleOAuthButton disabled={isLoading} className="w-full" />

        <div className="text-center">
          <p className="text-sm text-neutral-400">
            Already have an account?{' '}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-medium text-ember transition-colors hover:text-ember-soft"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-4 text-xs text-neutral-600">
            By creating an account, you agree to our{' '}
            <Link
              href={ROUTES.TERMS}
              className="text-neutral-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-ember"
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              href={ROUTES.PRIVACY}
              className="text-neutral-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-ember"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
