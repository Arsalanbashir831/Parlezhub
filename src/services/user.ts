import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';

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

export const userApi = {
  getStudentProfile: async (): Promise<UserProfile> => {
    const response = await apiCaller(
      API_ROUTES.STUDENT.PROFILE,
      'GET',
      undefined,
      {},
      true // Use auth token
    );
    return response.data;
  },

  getTeacherProfile: async (): Promise<UserProfile> => {
    const response = await apiCaller(
      API_ROUTES.TEACHER.PROFILE,
      'GET',
      undefined,
      {},
      true // Use auth token
    );
    return response.data;
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
