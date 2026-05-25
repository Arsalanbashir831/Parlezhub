'use client';

import React, { useCallback } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { UserMiniCard } from '@/components/layout/user-mini-card';
import { ROUTES } from '@/constants/routes';

export const TreeHeader = React.memo(() => {
  const router = useRouter();
  const { userRole, logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
    router.push(ROUTES.AUTH.LOGIN);
  }, [router, logout]);

  return (
    <header className="z-50 flex h-20 w-full items-center justify-between border-b border-primary-500/10 bg-background/95 px-4 md:px-8 shrink-0 select-none">
      <div className="flex items-center gap-4 md:gap-6">
        <Logo href={ROUTES.HOME} />
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
            <UserMiniCard roleLabel={userRole === 'TEACHER' ? 'Consultant' : 'Student'} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:bg-red-600/10 hover:text-red-400 rounded-xl"
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
});

TreeHeader.displayName = 'TreeHeader';
