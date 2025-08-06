'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { userApi, type UserProfile } from '@/services/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetchUser: () => void;
  clearUser: () => void;
  setUserRole: (role: 'TEACHER' | 'STUDENT') => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<'TEACHER' | 'STUDENT' | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  // Initialize user role from localStorage on mount
  useEffect(() => {
    const initializeUserRole = () => {
      try {
        const role = localStorage.getItem('user_role');
        if (role && (role === 'TEACHER' || role === 'STUDENT')) {
          setUserRole(role);
        }
      } catch (error) {
        console.error('Failed to initialize user role:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeUserRole();
  }, []);

  // Query for user profile based on role
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-profile', userRole],
    queryFn: async () => {
      if (!userRole) {
        throw new Error('User role not available');
      }

      if (userRole === 'STUDENT') {
        return userApi.getStudentProfile();
      } else {
        return userApi.getTeacherProfile();
      }
    },
    enabled: !!userRole && isInitialized, // Only run when role is available and context is initialized
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Handle query errors
  useEffect(() => {
    if (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, [error]);

  const refetchUser = () => {
    refetch();
  };

  const clearUser = () => {
    localStorage.removeItem('user_role');
    setUserRole(null);
    // Invalidate user profile query
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  };

  const handleSetUserRole = (role: 'TEACHER' | 'STUDENT') => {
    setUserRole(role);
    // Store role in localStorage
    localStorage.setItem('user_role', role);
    // Invalidate existing queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  };

  return (
    <UserContext.Provider
      value={{
        user: user || null,
        isLoading,
        error: error?.message || null,
        refetchUser,
        clearUser,
        setUserRole: handleSetUserRole,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
