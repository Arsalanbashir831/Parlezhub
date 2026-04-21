import { API_ROUTES } from '@/constants/api-routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  AstrologicalInsight,
  AstrologyAccess,
  AstrologyConsultant,
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
  SEARCH_TEACHERS: ['astrology', 'search-consultants'],
  SHARED_STUDENTS: ['astrology', 'consultant', 'shared-students'],
  GUEST_PROFILES: ['astrology', 'guest-profiles'],
};

/**
 * Helper to build URLs with optional student_id or guest_profile_id
 */
function buildAstroUrl(baseUrl: string, studentId?: string, guestProfileId?: string) {
  const params = new URLSearchParams();
  if (studentId) params.append('student_id', studentId);
  if (guestProfileId) params.append('guest_profile_id', guestProfileId);
  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}

export function useBirthProfile(studentId?: string, guestProfileId?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: guestProfileId
      ? [...ASTROLOGY_QUERY_KEYS.BIRTH_PROFILE, 'guest', guestProfileId]
      : studentId
      ? [...ASTROLOGY_QUERY_KEYS.BIRTH_PROFILE, 'student', studentId]
      : ASTROLOGY_QUERY_KEYS.BIRTH_PROFILE,
    queryFn: async () => {
      try {
        const url = buildAstroUrl(API_ROUTES.ASTROLOGY.BIRTH_PROFILE, studentId, guestProfileId);
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
    enabled,
  });
}

export function useNatalChart(enabled: boolean = true, studentId?: string, guestProfileId?: string) {
  return useQuery({
    queryKey: guestProfileId
      ? [...ASTROLOGY_QUERY_KEYS.NATAL_CHART, 'guest', guestProfileId]
      : studentId
      ? [...ASTROLOGY_QUERY_KEYS.NATAL_CHART, 'student', studentId]
      : ASTROLOGY_QUERY_KEYS.NATAL_CHART,
    queryFn: async () => {
      const url = buildAstroUrl(API_ROUTES.ASTROLOGY.NATAL_CHART, studentId, guestProfileId);
      const response = await apiCaller(url, 'GET');
      return response.data as NatalChartResponse;
    },
    enabled,
  });
}

export function useTransits(enabled: boolean = true, studentId?: string, guestProfileId?: string) {
  return useQuery({
    queryKey: guestProfileId
      ? [...ASTROLOGY_QUERY_KEYS.TRANSITS, 'guest', guestProfileId]
      : studentId
      ? [...ASTROLOGY_QUERY_KEYS.TRANSITS, 'student', studentId]
      : ASTROLOGY_QUERY_KEYS.TRANSITS,
    queryFn: async () => {
      const url = buildAstroUrl(API_ROUTES.ASTROLOGY.TRANSITS, studentId, guestProfileId);
      const response = await apiCaller(url, 'GET');
      return response.data as TransitResponse;
    },
    enabled,
  });
}

export function useNakshatraPredictions(
  enabled: boolean = true,
  studentId?: string,
  guestProfileId?: string
) {
  return useQuery({
    queryKey: guestProfileId
      ? ['astrology', 'nakshatra-predictions', 'guest', guestProfileId]
      : studentId
      ? ['astrology', 'nakshatra-predictions', 'student', studentId]
      : ['astrology', 'nakshatra-predictions'],
    queryFn: async () => {
      const url = buildAstroUrl(API_ROUTES.ASTROLOGY.NAKSHATRA_PREDICTIONS, studentId, guestProfileId);
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
  studentId?: string,
  guestProfileId?: string
) {
  return useQuery({
    queryKey: guestProfileId
      ? ['astrology', 'insights', slug, 'guest', guestProfileId]
      : studentId
      ? ['astrology', 'insights', slug, 'student', studentId]
      : ['astrology', 'insights', slug],
    queryFn: async () => {
      const baseUrl = `${API_ROUTES.ASTROLOGY.INSIGHTS}/${slug}/`;
      const url = buildAstroUrl(baseUrl, studentId, guestProfileId);
      const response = await apiCaller(url, 'GET');
      return response.data as AstrologicalInsight;
    },
    enabled,
    staleTime: 1000 * 60 * 60,
  });
}

export function useGuestProfiles() {
  return useQuery({
    queryKey: ASTROLOGY_QUERY_KEYS.GUEST_PROFILES,
    queryFn: async () => {
      const response = await apiCaller(API_ROUTES.ASTROLOGY.GUEST_PROFILES, 'GET');
      return response.data as BirthProfile[];
    },
  });
}

export function useCreateGuestProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BirthProfile & { guest_name: string }) => {
      const response = await apiCaller(API_ROUTES.ASTROLOGY.GUEST_PROFILES, 'POST', payload as any);
      return response.data as BirthProfile;
    },
    onSuccess: (data) => {
      toast.success('Guest profile created successfully');
      queryClient.invalidateQueries({ queryKey: ASTROLOGY_QUERY_KEYS.GUEST_PROFILES });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create guest profile');
    },
  });
}

export function useUpdateGuestProfile(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BirthProfile>) => {
      const response = await apiCaller(API_ROUTES.ASTROLOGY.GUEST_PROFILE_DETAIL(id), 'PUT', payload as any);
      return response.data as BirthProfile;
    },
    onSuccess: () => {
      toast.success('Guest profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ASTROLOGY_QUERY_KEYS.GUEST_PROFILES });
      queryClient.invalidateQueries({ queryKey: ['astrology', 'birth-profile', 'guest', String(id)] });
      queryClient.invalidateQueries({ queryKey: ['astrology', 'natal-chart', 'guest', String(id)] });
    },
  });
}

export function useDeleteGuestProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiCaller(API_ROUTES.ASTROLOGY.GUEST_PROFILE_DETAIL(id), 'DELETE');
    },
    onSuccess: () => {
      toast.success('Guest profile deleted');
      queryClient.invalidateQueries({ queryKey: ASTROLOGY_QUERY_KEYS.GUEST_PROFILES });
    },
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
      return response.data as AstrologyConsultant[];
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

export function useConsultantSharedStudents() {
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
