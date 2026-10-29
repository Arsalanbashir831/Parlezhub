import React from 'react';
import { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AuthButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'outline' | 'ghost' | 'cosmic' | 'cosmic-outline';
  isLoading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  type = 'submit',
  variant = 'cosmic',
  isLoading = false,
  disabled = false,
  loadingText,
  children,
  onClick,
  icon: Icon,
  className = 'w-full',
}) => {
  const isDisabled = isLoading || disabled;
  const displayText = isLoading && loadingText ? loadingText : children;

  return (
    <Button
      type={type}
      variant={variant}
      className={className}
      disabled={isDisabled}
      onClick={onClick}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {displayText}
    </Button>
  );
};
