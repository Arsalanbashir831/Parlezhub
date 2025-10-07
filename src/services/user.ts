import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';

import { authApi } from './auth';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  gender?: string | null;
  date_of_birth?: string | null;
  role: 'TEACHER' | 'STUDENT';
  profile_picture?: string | null;
  created_at: string;
  bio?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  status?: string;
  native_language?: string;
  learning_language?: string;
  // Teacher specific fields
  qualification?: string;
  experience_years?: number;
  certificates?: string[];
  about?: string;
}

export interface UpdateStudentProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  bio?: string;
  native_language?: string;
  learning_language?: string;
}

export interface UpdateTeacherProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  bio?: string;
  qualification?: string;
  experience_years?: number;
  about?: string;
}

export interface ProfileUpdateResponse {
  message: string;
  profile: UserProfile;
}

interface ProfilePictureUrlResponse {
  profile_picture_url: string;
}

interface RawProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  profile_picture?: string | null;
  created_at: string;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  postal_code?: string | null;
  status?: string | null;
  native_language?: string | null;
  learning_language?: string | null;
  qualification?: string | null;
  experience_years?: number | null;
  certificates?: string[] | null;
  about?: string | null;
}

// Helper function to convert auth profile to user profile format
const mapProfileToUserProfile = (
  profile: RawProfileData,
  role: 'TEACHER' | 'STUDENT'
): UserProfile => ({
  id: profile.id,
  email: profile.email,
  first_name: profile.first_name,
  last_name: profile.last_name,
  phone_number: profile.phone_number || undefined,
  gender: profile.gender || undefined,
  date_of_birth: profile.date_of_birth || undefined,
  role: role,
  profile_picture: profile.profile_picture || undefined,
  created_at: profile.created_at,
  bio: profile.bio || undefined,
  city: profile.city || undefined,
  country: profile.country || undefined,
  postal_code: profile.postal_code || undefined,
  status: profile.status || undefined,
  native_language: profile.native_language || undefined,
  learning_language: profile.learning_language || undefined,
  // Teacher-specific fields
  qualification: profile.qualification || undefined,
  experience_years: profile.experience_years || undefined,
  certificates: profile.certificates || undefined,
  about: profile.about || undefined,
});

export const userApi = {
  getStudentProfile: async (): Promise<UserProfile> => {
    const unifiedProfile = await authApi.getUnifiedProfile();
    if (!unifiedProfile.has_student || !unifiedProfile.student_profile) {
      throw new Error('Student profile not found');
    }
    return mapProfileToUserProfile(unifiedProfile.student_profile, 'STUDENT');
  },

  getTeacherProfile: async (): Promise<UserProfile> => {
    const unifiedProfile = await authApi.getUnifiedProfile();
    if (!unifiedProfile.has_teacher || !unifiedProfile.teacher_profile) {
      throw new Error('Teacher profile not found');
    }
    return mapProfileToUserProfile(unifiedProfile.teacher_profile, 'TEACHER');
  },

  updateStudentProfile: async (
    data: UpdateStudentProfileRequest
  ): Promise<UserProfile> => {
    const response = await apiCaller(
      API_ROUTES.STUDENT.UPDATE_PROFILE,
      'PATCH',
      data as unknown as Record<string, string>,
      {},
      true // Use auth token
    );
    // Return the profile object from the response
    return response.data.profile;
  },

  updateTeacherProfile: async (
    data: UpdateTeacherProfileRequest
  ): Promise<UserProfile> => {
    const response = await apiCaller(
      API_ROUTES.TEACHER.UPDATE_PROFILE,
      'PATCH',
      data as unknown as Record<string, string>,
      {},
      true // Use auth token
    );
    // Return the profile object from the response
    return response.data.profile;
  },

  uploadProfilePicture: async (
    file: File
  ): Promise<{ profile_picture: string }> => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    const response = await apiCaller(
      API_ROUTES.USER.UPLOAD_PROFILE_PICTURE, // same endpoint for both roles
      'POST',
      formData,
      {},
      true,
      'formdata'
    );
    return response.data;
  },

  getProfilePictureUrl: async (): Promise<ProfilePictureUrlResponse> => {
    const response = await apiCaller(
      API_ROUTES.USER.PROFILE_PICTURE_URL,
      'GET',
      undefined,
      {},
      true
    );
    return response.data;
  },
};
