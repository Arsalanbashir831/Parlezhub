'use client';

import { Lock, Mail, User } from 'lucide-react';
import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { FormField } from './form-fields';

interface BaseFieldProps {
    register: UseFormRegisterReturn;
    error?: FieldError;
}

interface EmailFieldProps extends BaseFieldProps {
    id?: string;
    placeholder?: string;
}

interface PasswordFieldProps extends BaseFieldProps {
    id?: string;
    placeholder?: string;
}

interface NameFieldProps extends BaseFieldProps {
    id?: string;
    placeholder?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({
    id = 'email',
    placeholder = 'Enter your email',
    register,
    error,
}) => (
    <FormField
        id={id}
        label="Email Address"
        icon={Mail}
        type="text"
        placeholder={placeholder}
        register={register}
        error={error}
        required
    />
);

export const PasswordField: React.FC<PasswordFieldProps> = ({
    id = 'password',
    placeholder = 'Enter your password',
    register,
    error,
}) => (
    <FormField
        id={id}
        label="Password"
        icon={Lock}
        type="password"
        placeholder={placeholder}
        register={register}
        error={error}
        required
    />
);

export const ConfirmPasswordField: React.FC<PasswordFieldProps> = ({
    id = 'confirmPassword',
    placeholder = 'Confirm your password',
    register,
    error,
}) => (
    <FormField
        id={id}
        label="Confirm Password"
        icon={Lock}
        type="password"
        placeholder={placeholder}
        register={register}
        error={error}
        required
    />
);

export const NameField: React.FC<NameFieldProps> = ({
    id = 'name',
    placeholder = 'Enter your full name',
    register,
    error,
}) => (
    <FormField
        id={id}
        label="Full Name"
        icon={User}
        type="text"
        placeholder={placeholder}
        register={register}
        error={error}
        required
    />
); 