import { API_ROUTES } from '@/constants/api-routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  AstrologicalInsight,
  AstrologyAccess,
  AstrologyTeacher,
  BirthProfile,
  NakshatraPredictionResponse,
  NatalChartResponse,
  SharedStudentAccess,
  TransitResponse,
} from '@/types/astrology';
import apiCaller from '@/lib/api-caller';

export const ASTROLOGY_QUERY_KEYS = {
  BIRTH_PROFILE: ['astrology', 'birth-profile'],
  NATAL_CHART: ['astrology', 'natal-chart'],
  TRANSITS: ['astrology', 'transits'],
  ACCESS_LIST: ['astrology', 'access-list'],
  SEARCH_TEACHERS: ['astrology', 'search-teachers'],
  SHARED_STUDENTS: ['astrology', 'teacher', 'shared-students'],
};

export function useBirthProfile(studentId?: string) {
  return useQuery({
    queryKey: studentId
      ? [...ASTROLOGY_QUERY_KEYS.BIRTH_PROFILE, studentId]
      : ASTROLOGY_QUERY_KEYS.BIRTH_PROFILE,
    queryFn: async () => {
      try {
        const url = studentId
          ? `${API_ROUTES.ASTROLOGY.BIRTH_PROFILE}?student_id=${studentId}`
          : API_ROUTES.ASTROLOGY.BIRTH_PROFILE;
        const response = await apiCaller(url, 'GET');
        return response.data as BirthProfile;
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        if (err?.response?.status === 404 || err?.response?.status === 400) {
          return null;
        }
        throw error;
      }
    },
  });
}

export function useNatalChart(enabled: boolean = true, studentId?: string) {
  return useQuery({
    queryKey: studentId
      ? [...ASTROLOGY_QUERY_KEYS.NATAL_CHART, studentId]
      : ASTROLOGY_QUERY_KEYS.NATAL_CHART,
    queryFn: async () => {
      const url = studentId
        ? `${API_ROUTES.ASTROLOGY.NATAL_CHART}?student_id=${studentId}`
        : API_ROUTES.ASTROLOGY.NATAL_CHART;
      const response = await apiCaller(url, 'GET');
      return response.data as NatalChartResponse;
    },
    enabled,
  });
}

export function useTransits(enabled: boolean = true, studentId?: string) {
  return useQuery({
    queryKey: studentId
      ? [...ASTROLOGY_QUERY_KEYS.TRANSITS, studentId]
      : ASTROLOGY_QUERY_KEYS.TRANSITS,
    queryFn: async () => {
      const url = studentId
        ? `${API_ROUTES.ASTROLOGY.TRANSITS}?student_id=${studentId}`
        : API_ROUTES.ASTROLOGY.TRANSITS;
      const response = await apiCaller(url, 'GET');
      return response.data as TransitResponse;
    },
    enabled,
  });
}

export function useNakshatraPredictions(
  enabled: boolean = true,
  studentId?: string
) {
  return useQuery({
    queryKey: studentId
      ? ['astrology', 'nakshatra-predictions', studentId]
      : ['astrology', 'nakshatra-predictions'],
    queryFn: async () => {
      const url = studentId
        ? `${API_ROUTES.ASTROLOGY.NAKSHATRA_PREDICTIONS}?student_id=${studentId}`
        : API_ROUTES.ASTROLOGY.NAKSHATRA_PREDICTIONS;
      const response = await apiCaller(url, 'GET');
      return response.data as NakshatraPredictionResponse;
    },
    enabled,
  });
}

export type SaveBirthProfilePayload = Omit<
  BirthProfile,
  'id' | 'user_name' | 'timezone_str' | 'created_at' | 'updated_at'
>;

export function useSaveBirthProfile(isUpdate: boolean = false) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveBirthProfilePayload) => {
      const response = await apiCaller(
        API_ROUTES.ASTROLOGY.BIRTH_PROFILE,
        isUpdate ? 'PUT' : 'POST',
        payload as unknown as Record<string, string | number | boolean>
      );
      return response.data as BirthProfile;
    },
    onSuccess: () => {
      toast.success('Birth profile saved successfully');
      queryClient.invalidateQueries({
        queryKey: ASTROLOGY_QUERY_KEYS.BIRTH_PROFILE,
      });
      queryClient.invalidateQueries({
        queryKey: ASTROLOGY_QUERY_KEYS.NATAL_CHART,
      });
      queryClient.invalidateQueries({
        queryKey: ASTROLOGY_QUERY_KEYS.TRANSITS,
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || 'Failed to save birth profile'
      );
    },
  });
}

export function useAstrologicalInsight(
  slug: string,
  enabled: boolean = true,
  studentId?: string
) {
  return useQuery({
    queryKey: studentId
      ? ['astrology', 'insights', slug, studentId]
      : ['astrology', 'insights', slug],
    queryFn: async () => {
      const baseUrl = `${API_ROUTES.ASTROLOGY.INSIGHTS}/${slug}/`;
      const url = studentId ? `${baseUrl}?student_id=${studentId}` : baseUrl;
      const response = await apiCaller(url, 'GET');
      return response.data as AstrologicalInsight;
    },
    enabled,
    staleTime: 1000 * 60 * 60,
  });
}

export function useSearchAstrologers(searchQuery: string) {
  return useQuery({
    queryKey: [...ASTROLOGY_QUERY_KEYS.SEARCH_TEACHERS, searchQuery],
    queryFn: async () => {
      const response = await apiCaller(
        `${API_ROUTES.ASTROLOGY.ASTROLOGER_SEARCH}?gig_category=astrology&search=${encodeURIComponent(searchQuery)}`,
        'GET'
      );
      return response.data as AstrologyTeacher[];
    },
    enabled: searchQuery.length > 0,
  });
}

export function useAstrologyAccessList() {
  return useQuery({
    queryKey: ASTROLOGY_QUERY_KEYS.ACCESS_LIST,
    queryFn: async () => {
      const response = await apiCaller(API_ROUTES.ASTROLOGY.ACCESS, 'GET');
      return response.data as AstrologyAccess[];
    },
  });
}

export function useGrantAstrologyAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teacherId: string) => {
      const response = await apiCaller(API_ROUTES.ASTROLOGY.ACCESS, 'POST', {
        teacher_id: teacherId,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Access granted successfully');
      queryClient.invalidateQueries({
        queryKey: ASTROLOGY_QUERY_KEYS.ACCESS_LIST,
      });
    },
    onError: () => {
      toast.error('Failed to grant access');
    },
  });
}

export function useRevokeAstrologyAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teacherId: string) => {
      const response = await apiCaller(
        `${API_ROUTES.ASTROLOGY.ACCESS}${teacherId}/`,
        'DELETE'
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Access revoked successfully');
      queryClient.invalidateQueries({
        queryKey: ASTROLOGY_QUERY_KEYS.ACCESS_LIST,
      });
    },
    onError: () => {
      toast.error('Failed to revoke access');
    },
  });
}

export function useTeacherSharedStudents() {
  return useQuery({
    queryKey: ASTROLOGY_QUERY_KEYS.SHARED_STUDENTS,
    queryFn: async () => {
      const response = await apiCaller(
        API_ROUTES.ASTROLOGY.TEACHER_STUDENTS,
        'GET'
      );
      return response.data as SharedStudentAccess[];
    },
  });
}
