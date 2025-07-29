import React from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormFieldProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  type?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  showToggle?: boolean;
  onToggle?: () => void;
  isToggled?: boolean;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  register,
  error,
  showToggle = false,
  onToggle,
  isToggled = false,
  className,
  multiline = false,
  rows = 3,
}) => {
  const inputType = showToggle ? (isToggled ? 'text' : 'password') : type;

  const inputClasses = cn(
    Icon && 'pl-10',
    showToggle && 'pr-10',
    error && 'border-red-500 focus:border-red-500',
    className
  );

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        )}
        <InputComponent
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={inputClasses}
          rows={multiline ? rows : undefined}
          {...register}
        />
        {showToggle && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
          >
            {isToggled ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};
