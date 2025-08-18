'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  userApi,
  type UpdateStudentProfileRequest,
  type UpdateTeacherProfileRequest,
  type UserProfile,
} from '@/services/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { getCookie, removeCookie, setCookie } from '@/lib/cookie-utils';
import { getErrorMessage } from '@/lib/error-utils';

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetchUser: () => void;
  clearUser: () => void;
  setUserRole: (role: 'TEACHER' | 'STUDENT') => void;
  updateStudentProfile: (
    data: UpdateStudentProfileRequest
  ) => Promise<UserProfile>;
  updateTeacherProfile: (
    data: UpdateTeacherProfileRequest
  ) => Promise<UserProfile>;
  isUpdatingProfile: boolean;
  uploadProfilePicture: (file: File) => Promise<{ profile_picture: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<'TEACHER' | 'STUDENT' | null>(() => {
    try {
      const role = getCookie('user_role');
      return role === 'TEACHER' || role === 'STUDENT' ? role : null;
    } catch {
      return null;
    }
  });
  const [userState, setUserState] = useState<UserProfile | null>(null);
  const queryClient = useQueryClient();

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
    enabled: !!userRole, // Only run when role is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on network errors or server errors (5xx)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status && axiosError.response?.status >= 500) {
          console.log('Server error detected, not retrying');
          return false;
        }
      }

      // Only retry once for other errors
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff with max 30s
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnReconnect: true, // Only refetch when network reconnects
  });

  // Keep userState in sync with query data
  useEffect(() => {
    if (user) setUserState(user);
  }, [user]);

  // Update student profile mutation
  const updateStudentMutation = useMutation({
    mutationFn: (data: UpdateStudentProfileRequest) =>
      userApi.updateStudentProfile(data),
    onSuccess: (updatedProfile) => {
      // Update the user profile in the cache and local state
      queryClient.setQueryData(['user-profile', userRole], updatedProfile);
      setUserState(updatedProfile);
      console.log('Student profile updated successfully:', updatedProfile);

      // Show success toast
      toast.success('Profile Updated Successfully!', {
        description: 'Your profile information has been saved.',
      });
    },
    onError: (error: unknown) => {
      console.error('Failed to update student profile:', error);
      const errorMessage = getErrorMessage(error, 'profile-update');
      toast.error('Profile Update Failed', {
        description: errorMessage,
      });
    },
  });

  // Update teacher profile mutation
  const updateTeacherMutation = useMutation({
    mutationFn: (data: UpdateTeacherProfileRequest) =>
      userApi.updateTeacherProfile(data),
    onSuccess: (updatedProfile) => {
      // Update the user profile in the cache and local state
      queryClient.setQueryData(['user-profile', userRole], updatedProfile);
      setUserState(updatedProfile);
      console.log('Teacher profile updated successfully:', updatedProfile);

      // Show success toast
      toast.success('Profile Updated Successfully!', {
        description: 'Your profile information has been saved.',
      });
    },
    onError: (error: unknown) => {
      console.error('Failed to update teacher profile:', error);
      const errorMessage = getErrorMessage(error, 'profile-update');
      toast.error('Profile Update Failed', {
        description: errorMessage,
      });
    },
  });

  // Handle query errors
  useEffect(() => {
    if (error) {
      console.error('Failed to fetch user profile:', error);
      const errorMessage = getErrorMessage(error, 'fetch-profile');

      // Only show toast for non-server errors to avoid spam
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status && axiosError.response?.status < 500) {
          toast.error('Failed to Load Profile', {
            description: errorMessage,
            action: {
              label: 'Retry',
              onClick: () => refetch(),
            },
          });
        } else {
          // For server errors, show a more specific message
          toast.error('Server Unavailable', {
            description: 'Unable to load profile. Please try again later.',
            action: {
              label: 'Retry',
              onClick: () => refetch(),
            },
          });
        }
      } else {
        toast.error('Failed to Load Profile', {
          description: errorMessage,
          action: {
            label: 'Retry',
            onClick: () => refetch(),
          },
        });
      }
    }
  }, [error, refetch]);

  const refetchUser = () => {
    refetch();
  };

  const clearUser = () => {
    // Clear cookies only
    removeCookie('user_role');
    setUserRole(null);
    setUserState(null);
    // Invalidate user profile query
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  };

  const handleSetUserRole = (role: 'TEACHER' | 'STUDENT') => {
    setUserRole(role);
    // Store role in cookies only
    setCookie('user_role', role);
    // Invalidate existing queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  };

  const updateStudentProfile = async (
    data: UpdateStudentProfileRequest
  ): Promise<UserProfile> => {
    return updateStudentMutation.mutateAsync(data);
  };

  const updateTeacherProfile = async (
    data: UpdateTeacherProfileRequest
  ): Promise<UserProfile> => {
    return updateTeacherMutation.mutateAsync(data);
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      const result = await userApi.uploadProfilePicture(file);
      // Get the profile picture URL after upload
      const urlResult = await userApi.getProfilePictureUrl();
      // Update the user state with the new profile picture URL
      if (userState) {
        setUserState({
          ...userState,
          profile_picture: urlResult.profile_picture_url,
        });
      }

      // Show success toast
      toast.success('Profile Picture Updated!', {
        description: 'Your profile picture has been uploaded successfully.',
      });

      return result;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      const errorMessage = getErrorMessage(error, 'profile-picture');
      toast.error('Upload Failed', {
        description: errorMessage,
      });
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user: userState,
        isLoading,
        error: error?.message || null,
        refetchUser,
        clearUser,
        setUserRole: handleSetUserRole,
        updateStudentProfile,
        updateTeacherProfile,
        isUpdatingProfile:
          updateStudentMutation.isPending || updateTeacherMutation.isPending,
        uploadProfilePicture,
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
