import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { useQueryClient } from '@tanstack/react-query';

export function useAuthEffects() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Invalidate and refetch user profile when user data changes
  useEffect(() => {
    if (user) {
      // Invalidate user profile query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    }
  }, [user, queryClient]);

  return null;
}
