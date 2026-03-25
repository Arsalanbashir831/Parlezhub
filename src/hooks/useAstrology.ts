import { API_ROUTES } from '@/constants/api-routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  BirthProfile,
  NatalChartResponse,
  TransitResponse,
} from '@/types/astrology';
import apiCaller from '@/lib/api-caller';

export const ASTROLOGY_QUERY_KEYS = {
  BIRTH_PROFILE: ['astrology', 'birth-profile'],
  NATAL_CHART: ['astrology', 'natal-chart'],
  TRANSITS: ['astrology', 'transits'],
};

export function useBirthProfile() {
  return useQuery({
    queryKey: ASTROLOGY_QUERY_KEYS.BIRTH_PROFILE,
    queryFn: async () => {
      try {
        const response = await apiCaller(
          API_ROUTES.ASTROLOGY.BIRTH_PROFILE,
          'GET'
        );
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

export function useNatalChart(enabled: boolean = true) {
  return useQuery({
    queryKey: ASTROLOGY_QUERY_KEYS.NATAL_CHART,
    queryFn: async () => {
      const response = await apiCaller(API_ROUTES.ASTROLOGY.NATAL_CHART, 'GET');
      return response.data as NatalChartResponse;
    },
    enabled,
  });
}

export function useTransits(enabled: boolean = true) {
  return useQuery({
    queryKey: ASTROLOGY_QUERY_KEYS.TRANSITS,
    queryFn: async () => {
      const response = await apiCaller(API_ROUTES.ASTROLOGY.TRANSITS, 'GET');
      return response.data as TransitResponse;
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
