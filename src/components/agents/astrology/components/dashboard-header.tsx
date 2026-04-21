'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { UserMiniCard } from '@/components/layout/user-mini-card';

interface DashboardHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  className,
  children,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <header
      className={cn(
        'z-50 flex h-20 w-full items-center justify-between border-b border-primary-300/60 bg-background/80 px-4 backdrop-blur-md md:px-8',
        className
      )}
    >
      <div className="flex items-center gap-2 md:gap-4">
        <Logo href={ROUTES.HOME} />
        {children}
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
            <UserMiniCard roleLabel="Astrologer" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:bg-red-600 hover:text-red-200"
            onClick={() => {
              logout();
              router.push(ROUTES.AUTH.LOGIN);
            }}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
