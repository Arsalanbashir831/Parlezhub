# Google OAuth Integration

This document explains the Google OAuth integration added to the LinguaFlex application.

## Overview

The Google OAuth integration allows users to sign in and sign up using their Google accounts. The implementation follows a two-step process:

1. **Initiate OAuth**: Call `/auth/google/initiate/` to get the Google OAuth URL
2. **Handle Callback**: Process the callback from Google with tokens via `/auth/google/callback/`

## API Endpoints

### 1. Initiate OAuth

- **Endpoint**: `/auth/google/initiate/`
- **Method**: POST
- **Body**: Empty `{}`
- **Response**:

```json
{
  "success": true,
  "oauth_url": "https://...",
  "message": "Redirect user to oauth_url to complete Google authentication"
}
```

### 2. Handle Callback

- **Endpoint**: `/auth/google/callback/`
- **Method**: POST
- **Body**:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "role": "STUDENT" // Required for signup, optional for login
}
```

- **Response**:

```json
{
  "success": true,
  "message": "User logged in successfully via Google",
  "user": { ... },
  "access_token": "...",
  "refresh_token": "...",
  "created": false,
  "is_existing_user_login": true,
  "requires_profile_completion": false,
  "flow_type": "login"
}
```

## Components

### 1. GoogleOAuthButton

Basic Google OAuth button for login.

```tsx
<GoogleOAuthButton mode="login" disabled={isLoading} className="w-full" />
```

### 2. GoogleSignupWithRole

Google OAuth button with role selection for signup.

```tsx
<GoogleSignupWithRole disabled={isLoading} className="w-full" />
```

### 3. GoogleOAuthCallback

Handles the OAuth callback from Google (used in `/auth/callback/google` page).

```tsx
<GoogleOAuthCallback />
```

## Flow

### Sign In Flow

1. User clicks "Continue with Google" on sign-in page
2. App calls `/auth/google/initiate/`
3. User is redirected to Google OAuth
4. Google redirects back to `/auth/callback/google`
5. App extracts tokens from URL hash and calls `/auth/google/callback/`
6. User is logged in and redirected to dashboard

### Sign Up Flow

1. User clicks "Sign up with Google" on signup page
2. User selects role (Student/Teacher)
3. App calls `/auth/google/initiate/`
4. User is redirected to Google OAuth
5. Google redirects back to `/auth/callback/google`
6. App extracts tokens from URL hash and calls `/auth/google/callback/` with selected role
7. User account is created and user is redirected to dashboard

## Key Features

- **Role-based signup**: Users must select Student or Teacher role during Google signup
- **Seamless login**: Existing users can login without role selection
- **Error handling**: Comprehensive error handling with toast notifications
- **Loading states**: Visual feedback during OAuth process
- **Responsive design**: Works on desktop and mobile
- **Security**: Tokens stored in httpOnly cookies
- **Middleware protection**: OAuth callback route is public

## Files Modified/Created

### New Components

- `src/components/auth/google-oauth-button.tsx`
- `src/components/auth/google-oauth-callback.tsx`
- `src/components/auth/google-signup-with-role.tsx`

### New Pages

- `src/app/auth/callback/google/page.tsx`

### Modified Files

- `src/services/auth.ts` - Added Google OAuth API functions
- `src/constants/api-routes.ts` - Added Google OAuth endpoints
- `src/contexts/auth-context.tsx` - Added Google OAuth context methods
- `src/app/auth/sign-in/page.tsx` - Added Google login button
- `src/app/auth/signup/page.tsx` - Added Google signup with role selection
- `src/middleware.ts` - Added callback route to public routes

## Usage in Pages

The integration is already added to the existing sign-in and signup pages. Users will see:

- **Sign In Page**: "Continue with Google" button below the regular form
- **Sign Up Page**: "Sign up with Google" button that opens role selection modal

## Environment Requirements

Make sure your backend is configured with:

- Google OAuth client credentials
- Proper redirect URLs configured in Google Console
- The callback URL should be: `https://yourdomain.com/auth/callback/google`

## Testing

1. Navigate to `/auth/sign-in` or `/auth/signup`
2. Click the Google OAuth buttons
3. Complete OAuth flow with Google
4. Verify user is created/logged in and redirected properly
5. Check that tokens are stored in cookies
6. Verify role-based dashboard redirection works
