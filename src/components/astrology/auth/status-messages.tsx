import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusMessageProps {
  message: string | React.ReactNode;
  icon?: LucideIcon;
}

export const ErrorMessage: React.FC<StatusMessageProps> = ({ message }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
    <p className="text-sm text-red-600">{message}</p>
  </div>
);

export const SuccessMessage: React.FC<StatusMessageProps> = ({
  message,
  icon: Icon,
}) => (
  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
    <div className="flex items-center justify-center text-green-800">
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span className="text-sm">{message}</span>
    </div>
  </div>
);

export const InfoMessage: React.FC<StatusMessageProps> = ({
  message,
  icon: Icon,
}) => (
  <div className="rounded-lg border border-primary-500/50 bg-primary-500/5 p-4">
    <div className="flex items-start text-primary-800">
      {Icon && <Icon className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />}
      <p className="text-sm">{message}</p>
    </div>
  </div>
);
