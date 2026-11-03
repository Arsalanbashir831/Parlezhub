'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  serviceApi,
  serviceUtils,
  type PublicService,
} from '@/services/service';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  buildAstrologerProfiles,
  filterAstrologerProfiles,
  type AstrologerProfile,
} from '@/lib/astrologer-directory';
import { getErrorMessage } from '@/lib/error-utils';

// Kept for legacy service cards that are not used by the profile directory.
export interface ServiceCardData {
  id: string;
  service: PublicService;
  consultantName: string;
  consultantAvatar: string | null;
  consultantQualification: string;
  consultantExperience: number;
  consultantBio: string;
  consultantLocation: string;
  consultantEmail: string;
}

export const useConsultants = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<AstrologerProfile | null>(null);

  const {
    data: services = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['public-services'],
    queryFn: async () =>
      (await serviceApi.getPublicServices()).map(
        serviceUtils.publicApiResponseToService
      ),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const profiles = useMemo(() => buildAstrologerProfiles(services), [services]);
  const maxPrice = useMemo(
    () =>
      Math.max(
        100,
        ...profiles.flatMap((profile) =>
          profile.services.map((service) =>
            Number.isFinite(service.price)
              ? Math.ceil(service.price / 10) * 10
              : 0
          )
        )
      ),
    [profiles]
  );
  const effectivePriceRange = useMemo<[number, number]>(
    () =>
      priceRange
        ? [Math.min(priceRange[0], maxPrice), Math.min(priceRange[1], maxPrice)]
        : [0, maxPrice],
    [priceRange, maxPrice]
  );
  const filteredProfiles = useMemo(
    () => filterAstrologerProfiles(profiles, searchQuery, effectivePriceRange),
    [profiles, searchQuery, effectivePriceRange]
  );
  const error = queryError
    ? getErrorMessage(queryError, 'fetch-public-services')
    : null;

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setPriceRange(null);
    setShowFilters(false);
  }, []);

  const refreshConsultants = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['public-services'] });
  }, [queryClient]);

  return {
    profiles: filteredProfiles,
    totalProfiles: profiles.length,
    searchQuery,
    priceRange: effectivePriceRange,
    maxPrice,
    showFilters,
    selectedProfile,
    isLoading,
    error,
    handleSearchChange: setSearchQuery,
    handlePriceRangeChange: (value: number[]) =>
      setPriceRange([value[0] ?? 0, value[1] ?? maxPrice]),
    handleToggleFilters: () => setShowFilters((current) => !current),
    handleClearFilters,
    handleSelectProfile: setSelectedProfile,
    handleCloseDetailsPanel: () => setSelectedProfile(null),
    refreshConsultants,
  };
};
