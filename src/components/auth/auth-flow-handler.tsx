'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';

export default function AuthFlowHandler() {
  const { isAuthenticated, userRole } = useAuth();
  const { setUserRole } = useUser();

  useEffect(() => {
    if (isAuthenticated && userRole) {
      // Set the user role in the user context to trigger profile fetching
      setUserRole(userRole);
    }
  }, [isAuthenticated, userRole, setUserRole]);

  return null; // This component doesn't render anything
}
