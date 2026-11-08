'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { useGoogleSignIn } from '@/features/auth';

/** ParlezHub's form pieces for the shared auth flow; styled from the app's
 *  theme tokens (parlezhub.css) only. */

const PILL =
  'h-12 w-full rounded-full border-[1.5px] border-input bg-card text-[15px] text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 aria-[invalid=true]:border-destructive';

export function Field({
  label,
  type = 'text',
  icon: Icon,
  required = false,
  labelAside,
  autoComplete,
  placeholder,
  register,
  error,
}: {
  label: string;
  type?: 'text' | 'email' | 'password';
  /** Leading icon inside the pill. */
  icon?: LucideIcon;
  /** Marks the label with an asterisk (validation lives in the shared schema). */
  required?: boolean;
  /** Shown at the end of the label row, e.g. "Forgot Password?". */
  labelAside?: React.ReactNode;
  autoComplete?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[15px] font-bold text-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-required={required || undefined}
          className={cn(PILL, Icon ? 'pl-12' : 'pl-5', isPassword ? 'pr-12' : 'pr-5')}
          {...register}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-full text-primary transition-colors hover:text-[hsl(var(--primary-deep))]"
          >
            {revealed ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error?.message && (
        <p id={`${id}-error`} className="pl-4 text-xs font-medium text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  isLoading,
  loadingText = 'Please wait…',
  children,
  type = 'submit',
  variant = 'primary',
  withArrow = false,
  onClick,
  disabled,
}: {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary';
  /** Trailing arrow on the primary call to action. */
  withArrow?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary'
          ? 'ph-cta text-primary-foreground'
          : 'ph-raised border border-border bg-card text-foreground hover:bg-secondary'
      )}
    >
      {isLoading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
      {isLoading ? loadingText : children}
      {withArrow && !isLoading && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}

/** Google's multi-colour "G", per its brand guidelines. */
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function GoogleButton({ disabled }: { disabled?: boolean }) {
  const { start, isLoading } = useGoogleSignIn();

  return (
    <button
      type="button"
      onClick={start}
      disabled={disabled || isLoading}
      className="ph-raised inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-6 text-base font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
      ) : (
        <GoogleGlyph />
      )}
      {isLoading ? 'Connecting to Google…' : 'Continue with Google'}
    </button>
  );
}

const NOTICE_TONES = {
  error: { icon: AlertCircle, className: 'border-destructive/30 bg-destructive/5 text-destructive' },
  info: { icon: Info, className: 'border-primary/20 bg-secondary text-secondary-foreground' },
  success: { icon: CheckCircle2, className: 'border-emerald-600/25 bg-emerald-50 text-emerald-800' },
} as const;

export function Notice({
  tone,
  children,
}: {
  tone: keyof typeof NOTICE_TONES;
  children: React.ReactNode;
}) {
  const { icon: Icon, className } = NOTICE_TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2.5 rounded-2xl border p-3.5 text-sm', className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
      <span className="h-px flex-1 bg-input" />
      {label}
      <span className="h-px flex-1 bg-input" />
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-semibold text-primary underline decoration-1 underline-offset-4 transition-colors hover:text-[hsl(var(--primary-deep))]"
    >
      {children}
    </Link>
  );
}
