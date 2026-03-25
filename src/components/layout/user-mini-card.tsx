'use client';

import { useUser } from '@/contexts/user-context';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserMiniCardProps {
  roleLabel: string;
  collapsed?: boolean;
}

export const UserMiniCard: React.FC<UserMiniCardProps> = ({
  roleLabel,
  collapsed = false,
}) => {
  const { user } = useUser();

  if (collapsed) {
    return (
      <div className="mb-4 flex justify-center">
        <Avatar>
          <AvatarImage src={user?.profile_picture || ''} />
          <AvatarFallback>
            {user?.first_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-3">
      <Avatar>
        <AvatarImage src={user?.profile_picture || ''} />
        <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200">
          {user?.first_name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
          {roleLabel}
        </p>
      </div>
    </div>
  );
};
