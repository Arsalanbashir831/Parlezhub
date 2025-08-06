import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'TEACHER' | 'STUDENT';
  is_verified: boolean;
  profile_picture: string;
  created_at: string;
  updated_at: string;
  // Student specific fields
  city?: string;
  country?: string;
  postal_code?: string;
  address?: string;
  // Teacher specific fields
  qualification?: string;
  bio?: string;
  hourly_rate?: number;
  subjects?: string[];
  experience_years?: number;
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
};
