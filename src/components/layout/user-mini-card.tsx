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
      <div className="mb-6 flex justify-center p-2">
        <Avatar className="h-10 w-10 border border-primary-500/20">
          <AvatarImage src={user?.profile_picture || ''} />
          <AvatarFallback className="bg-primary-500/10 font-serif font-bold text-primary-500">
            {user?.first_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/[0.03] shadow-lg">
      <Avatar className="h-10 w-10 border border-primary-500/20">
        <AvatarImage src={user?.profile_picture || ''} />
        <AvatarFallback className="bg-primary-500/10 font-serif font-bold text-primary-500">
          {user?.first_name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-sm font-bold text-white leading-tight">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500/60 mt-0.5">{roleLabel}</p>
      </div>
    </div>
  );
};
