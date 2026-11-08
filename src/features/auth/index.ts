/**
 * The auth and onboarding flow every app shares: validation, submit handlers,
 * redirects and link verification, with no markup. Each app's pages under
 * src/app/<app>/auth and src/app/<app>/onboarding render these with their own
 * UI, so the flow is identical and only the look differs.
 */
export * from './schemas';
export { useCurrentApp } from './use-current-app';
export { useSignIn } from './use-sign-in';
export { useSignUp } from './use-sign-up';
export { useForgotPassword } from './use-forgot-password';
export { useResetPassword, type ResetPasswordStatus } from './use-reset-password';
export { useVerifyEmail } from './use-verify-email';
export { useChooseRole, type ChoosableRole } from './use-choose-role';
export { useGoogleSignIn } from './use-google-sign-in';
