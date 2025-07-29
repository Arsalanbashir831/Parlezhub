import React from "react";
import { LucideIcon } from "lucide-react";

interface StatusMessageProps {
	message: string | React.ReactNode;
	icon?: LucideIcon;
}

export const ErrorMessage: React.FC<StatusMessageProps> = ({ message }) => (
	<div className="bg-red-50 border border-red-200 rounded-lg p-3">
		<p className="text-sm text-red-600">{message}</p>
	</div>
);

export const SuccessMessage: React.FC<StatusMessageProps> = ({ 
	message, 
	icon: Icon 
}) => (
	<div className="bg-green-50 border border-green-200 rounded-lg p-3">
		<div className="flex items-center justify-center text-green-800">
			{Icon && <Icon className="w-4 h-4 mr-2" />}
			<span className="text-sm">{message}</span>
		</div>
	</div>
);

export const InfoMessage: React.FC<StatusMessageProps> = ({ 
	message, 
	icon: Icon 
}) => (
	<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
		<div className="flex items-start text-blue-800">
			{Icon && <Icon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />}
			<p className="text-sm">{message}</p>
		</div>
	</div>
); 