import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Mail, Lock, User } from "lucide-react";
import { FormField } from "./form-field";

interface BaseFieldProps {
	register: UseFormRegisterReturn;
	error?: FieldError;
	className?: string;
}

interface EmailFieldProps extends BaseFieldProps {
	id?: string;
	placeholder?: string;
}

interface PasswordFieldProps extends BaseFieldProps {
	id?: string;
	placeholder?: string;
	showPassword: boolean;
	setShowPassword: (show: boolean) => void;
}

interface TextFieldProps extends BaseFieldProps {
	id?: string; // Make id optional since we have defaults
	label: string;
	placeholder?: string;
	icon?: React.ComponentType<any>;
	multiline?: boolean;
	rows?: number;
}

export const EmailField: React.FC<EmailFieldProps> = ({ 
	id = "email",
	placeholder = "Enter your email",
	register, 
	error, 
	className 
}) => (
	<FormField
		id={id}
		label="Email Address"
		icon={Mail}
		type="email"
		placeholder={placeholder}
		register={register}
		error={error}
		className={className}
	/>
);

export const PasswordField: React.FC<PasswordFieldProps> = ({ 
	id = "password",
	placeholder = "Enter your password",
	register, 
	error, 
	showPassword, 
	setShowPassword, 
	className 
}) => (
	<FormField
		id={id}
		label="Password"
		icon={Lock}
		type="password"
		placeholder={placeholder}
		register={register}
		error={error}
		showToggle={true}
		isToggled={showPassword}
		onToggle={() => setShowPassword(!showPassword)}
		className={className}
	/>
);

export const ConfirmPasswordField: React.FC<PasswordFieldProps> = ({ 
	id = "confirmPassword",
	placeholder = "Confirm your password",
	register, 
	error, 
	showPassword, 
	setShowPassword, 
	className 
}) => (
	<FormField
		id={id}
		label="Confirm Password"
		icon={Lock}
		type="password"
		placeholder={placeholder}
		register={register}
		error={error}
		showToggle={true}
		isToggled={showPassword}
		onToggle={() => setShowPassword(!showPassword)}
		className={className}
	/>
);

export const NameField: React.FC<Omit<TextFieldProps, 'label' | 'icon'>> = ({ 
	id = "name",
	placeholder = "Enter your full name",
	register, 
	error, 
	className 
}) => (
	<FormField
		id={id}
		label="Full Name"
		icon={User}
		type="text"
		placeholder={placeholder}
		register={register}
		error={error}
		className={className}
	/>
);
