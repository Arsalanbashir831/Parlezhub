'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TextFieldProps {
  id?: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  type?: 'text' | 'password' | 'textarea';
  placeholder?: string;
  required?: boolean;
  register: UseFormRegisterReturn;
  error?: FieldError;
}

export function FormField({
  id,
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  required = false,
  register,
  error,
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  if (type === 'textarea') {
    return (
      <div>
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        <div className="relative mt-1">
          {Icon && (
            <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          )}
          <Textarea
            id={fieldId}
            placeholder={placeholder}
            className={Icon ? 'pl-10' : ''}
            {...register}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      <div className="relative mt-1">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        )}
        <Input
          id={fieldId}
          type={type === 'password' && showPassword ? 'text' : type}
          placeholder={placeholder}
          className={Icon ? 'pl-10' : ''}
          {...register}
        />
        {type === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
