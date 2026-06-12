import { API_ROUTES } from '@/constants/api-routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { AxiosError } from 'axios';
import {
  AstrologicalInsight,
  AstrologyAccess,
  AstrologyConsultant,
  AstrologyReportRecord,
  BirthProfile,
  ConfirmReportPaymentResponse,
  DashaResponse,
  InitiateReportPaymentResponse,
  NakshatraPredictionResponse,
  NatalChartResponse,
  SharedStudentAccess,
  TransitResponse,
  PaginatedResponse,
} from '@/types/astrology';
import apiCaller, { RequestData } from '@/lib/api-caller';

export const ASTROLOGY_QUERY_KEYS = {
  BIRTH_PROFILE: ['astrology', 'birth-profile'],
  NATAL_CHART: ['astrology', 'natal-chart'],
  TRANSITS: ['astrology', 'transits'],
  ACCESS_LIST: ['astrology', 'access-list'],
  SEARCH_TEACHERS: ['astrology', 'search-consultants'],
  SHARED_STUDENTS: ['astrology', 'consultant', 'shared-students'],
  GUEST_PROFILES: ['astrology', 'guest-profiles'],
  DASHA: ['astrology', 'dasha'],
  REPORTS: ['astrology', 'reports'],
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

export function useTransits(enabled: boolean = true, studentId?: string, guestProfileId?: string, transitDate?: string) {
  return useQuery({
    queryKey: guestProfileId
      ? [...ASTROLOGY_QUERY_KEYS.TRANSITS, 'guest', guestProfileId, transitDate]
      : studentId
        ? [...ASTROLOGY_QUERY_KEYS.TRANSITS, 'student', studentId, transitDate]
        : [...ASTROLOGY_QUERY_KEYS.TRANSITS, transitDate],
    queryFn: async () => {
      let url = buildAstroUrl(API_ROUTES.ASTROLOGY.TRANSITS, studentId, guestProfileId);
      if (transitDate) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}transit_date=${transitDate}`;
      }
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

export function useGuestProfiles(params: { search?: string; page?: number; page_size?: number } = {}) {
  return useQuery({
    queryKey: [...ASTROLOGY_QUERY_KEYS.GUEST_PROFILES, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());

      const queryString = queryParams.toString();
      const url = queryString 
        ? `${API_ROUTES.ASTROLOGY.GUEST_PROFILES}?${queryString}`
        : API_ROUTES.ASTROLOGY.GUEST_PROFILES;

      const response = await apiCaller(url, 'GET');
      return response.data as PaginatedResponse<BirthProfile>;
    },
  });
}

export type CreateGuestProfilePayload = SaveBirthProfilePayload & {
  guest_name: string;
};

export function useCreateGuestProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateGuestProfilePayload) => {
      const response = await apiCaller(
        API_ROUTES.ASTROLOGY.GUEST_PROFILES,
        'POST',
        payload as unknown as RequestData
      );
      return response.data as BirthProfile;
    },
    onSuccess: () => {
      toast.success('Guest profile created successfully');
      queryClient.invalidateQueries({ queryKey: ASTROLOGY_QUERY_KEYS.GUEST_PROFILES });
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(
        err?.response?.data?.detail || 'Failed to create guest profile'
      );
    },
  });
}

export function useUpdateGuestProfile(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CreateGuestProfilePayload>) => {
      const response = await apiCaller(
        API_ROUTES.ASTROLOGY.GUEST_PROFILE_DETAIL(id),
        'PUT',
        payload as unknown as RequestData
      );
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
    onError: (error: unknown) => {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(err?.response?.data?.detail || 'Failed to grant access');
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
    onError: (error: unknown) => {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(err?.response?.data?.detail || 'Failed to revoke access');
    },
  });
}

export function useConsultantSharedStudents(params: { search?: string; page?: number; page_size?: number } = {}) {
  return useQuery({
    queryKey: [...ASTROLOGY_QUERY_KEYS.SHARED_STUDENTS, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());

      const queryString = queryParams.toString();
      const url = queryString 
        ? `${API_ROUTES.ASTROLOGY.TEACHER_STUDENTS}?${queryString}`
        : API_ROUTES.ASTROLOGY.TEACHER_STUDENTS;

      const response = await apiCaller(url, 'GET');
      return response.data as PaginatedResponse<SharedStudentAccess>;
    },
  });
}

export function useDasha(enabled: boolean = true, studentId?: string, guestProfileId?: string) {
  return useQuery({
    queryKey: guestProfileId
      ? [...ASTROLOGY_QUERY_KEYS.DASHA, 'guest', guestProfileId]
      : studentId
        ? [...ASTROLOGY_QUERY_KEYS.DASHA, 'student', studentId]
        : ASTROLOGY_QUERY_KEYS.DASHA,
    queryFn: async () => {
      const url = buildAstroUrl(API_ROUTES.ASTROLOGY.DASHA, studentId, guestProfileId);
      const response = await apiCaller(url, 'GET');
      return response.data as DashaResponse;
    },
    enabled,
    staleTime: 1000 * 60 * 30, // 30 min cache — dasha data changes infrequently
  });
}

export interface FestivalCalendarPayload {
  year: number;
  festival_type?: string | null;
  language?: string | null;
  region?: string | null;
}

export interface FestivalCalendarResponse {
  year: number;
  festival_count: number;
  calculation_notes: {
    note: string;
  };
  filters_applied: {
    festival_type?: string;
    language?: string;
    region?: string;
  };
  festivals: {
    date: string;
    key: string;
    name: string;
    name_hindi?: string;
    significance?: string;
    timing_type?: string;
    type?: string;
    weekday?: string;
    duration_days?: number;
    end_date?: string;
    regions?: string[];
    rituals?: string[];
  }[];
  ekadashis: {
    date: string;
    lunar_month: string;
    name: string;
    paksha: string;
  }[];
  purnimas: {
    date: string;
    lunar_month: string;
    name: string;
    significance?: string;
  }[];
  special_amavasyas: {
    date: string;
    lunar_month: string;
    name: string;
    significance?: string;
  }[];
}

export function useFestivalCalendar(payload: FestivalCalendarPayload, enabled: boolean = true) {
  return useQuery({
    queryKey: ['astrology', 'festival-calendar', payload],
    queryFn: async () => {
      const response = await apiCaller(
        API_ROUTES.ASTROLOGY.FESTIVAL_CALENDAR,
        'POST',
        payload as unknown as Record<string, string | number | boolean>
      );
      return response.data as FestivalCalendarResponse;
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
}

// ===========================================================================
// Report hooks
// ===========================================================================

/**
 * Fetch all AstrologyReport records for the current user's birth profile.
 * Teachers can pass birth_profile_id to view a guest profile's reports.
 */
export function useReports(birthProfileId?: number) {
  return useQuery({
    queryKey: [...ASTROLOGY_QUERY_KEYS.REPORTS, birthProfileId],
    queryFn: async () => {
      const url = birthProfileId
        ? `${API_ROUTES.ASTROLOGY.REPORTS}?birth_profile_id=${birthProfileId}`
        : API_ROUTES.ASTROLOGY.REPORTS;
      const response = await apiCaller(url, 'GET');
      return response.data as AstrologyReportRecord[];
    },
    staleTime: 1000 * 30, // 30-second cache — refetch after payment
  });
}

/**
 * Create (or retrieve an existing) Stripe PaymentIntent for a report.
 * Returns the client_secret used by Stripe.js to confirm payment on the frontend.
 */
export function useInitiateReportPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      report_type?: string;
      birth_profile_id?: number;
    }) => {
      const response = await apiCaller(
        API_ROUTES.ASTROLOGY.REPORT_PURCHASE,
        'POST',
        payload as RequestData
      );
      return response.data as InitiateReportPaymentResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGY_QUERY_KEYS.REPORTS });
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      const msg = error.response?.data?.detail || 'Failed to initiate payment. Please try again.';
      toast.error('Payment Error', { description: msg });
    },
  });
}

/**
 * Called after Stripe.js successfully confirms a card payment.
 * Sends the payment_intent_id to the backend which will verify it,
 * mark the report as paid, and trigger PDF generation.
 */
export function useConfirmReportPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const response = await apiCaller(
        API_ROUTES.ASTROLOGY.REPORT_CONFIRM_PAYMENT,
        'POST',
        { payment_intent_id: paymentIntentId } as RequestData
      );
      return response.data as ConfirmReportPaymentResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGY_QUERY_KEYS.REPORTS });
      toast.success('Payment confirmed!', { description: 'Your report is being generated.' });
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      const msg = error.response?.data?.detail || 'Could not confirm payment. Please contact support.';
      toast.error('Confirmation Error', { description: msg });
    },
  });
}
