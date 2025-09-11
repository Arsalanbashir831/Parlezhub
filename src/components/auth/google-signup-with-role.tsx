'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { GoogleOAuthButton } from './google-oauth-button';

interface GoogleSignupWithRoleProps {
  disabled?: boolean;
  className?: string;
}

export function GoogleSignupWithRole({
  disabled = false,
  className,
}: GoogleSignupWithRoleProps) {
  const [selectedRole, setSelectedRole] = useState<
    'TEACHER' | 'STUDENT' | null
  >(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const handleGoogleSignupClick = () => {
    setShowRoleSelection(true);
  };

  const handleRoleSelect = (role: 'TEACHER' | 'STUDENT') => {
    setSelectedRole(role);
  };

  const handleCancel = () => {
    setShowRoleSelection(false);
    setSelectedRole(null);
  };

  if (!showRoleSelection) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignupClick}
        disabled={disabled}
        className={className}
      >
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"
          />
        </svg>
        Sign up with Google
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-lg">
          Choose Your Account Type
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedRole || ''}
          onValueChange={(value) =>
            handleRoleSelect(value as 'TEACHER' | 'STUDENT')
          }
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50">
            <RadioGroupItem value="STUDENT" id="student" />
            <Label htmlFor="student" className="flex-1 cursor-pointer">
              <div className="font-medium">Student</div>
              <div className="text-sm text-gray-500">
                Learn languages with AI tutors and connect with teachers
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50">
            <RadioGroupItem value="TEACHER" id="teacher" />
            <Label htmlFor="teacher" className="flex-1 cursor-pointer">
              <div className="font-medium">Teacher</div>
              <div className="text-sm text-gray-500">
                Teach languages, create services, and manage students
              </div>
            </Label>
          </div>
        </RadioGroup>

        <div className="flex space-x-2 pt-2">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <GoogleOAuthButton
            mode="signup"
            role={selectedRole || undefined}
            disabled={!selectedRole || disabled}
            className="flex-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
