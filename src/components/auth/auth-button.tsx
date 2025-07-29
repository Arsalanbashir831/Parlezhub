import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface AuthButtonProps {
	type?: "button" | "submit" | "reset";
	variant?: "default" | "outline" | "ghost";
	isLoading?: boolean;
	disabled?: boolean;
	loadingText?: string;
	children: React.ReactNode;
	onClick?: () => void;
	icon?: LucideIcon;
	className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
	type = "submit",
	variant = "default",
	isLoading = false,
	disabled = false,
	loadingText,
	children,
	onClick,
	icon: Icon,
	className = "w-full bg-primary-500 hover:bg-primary-600",
}) => {
	const isDisabled = isLoading || disabled;
	const displayText = isLoading && loadingText ? loadingText : children;

	return (
		<Button
			type={type}
			variant={variant}
			className={className}
			disabled={isDisabled}
			onClick={onClick}>
			{Icon && <Icon className="w-4 h-4 mr-2" />}
			{displayText}
		</Button>
	);
}; 