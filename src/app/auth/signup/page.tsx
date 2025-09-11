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
import { GoogleSignupWithRole } from '@/components/auth/google-signup-with-role';
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
    role: z.enum(['TEACHER', 'STUDENT']),
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
      role: 'STUDENT',
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
        role: data.role.toLowerCase() as 'student' | 'teacher',
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

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            I am a:
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="STUDENT"
                {...register('role')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Student</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="TEACHER"
                {...register('role')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Teacher</span>
            </label>
          </div>
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {error && <ErrorMessage message={error} />}

        <AuthButton type="submit" isLoading={isLoading}>
          Create Account
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

        <GoogleSignupWithRole disabled={isLoading} className="w-full" />

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
