'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  serviceApi,
  serviceUtils,
  type PublicService,
} from '@/services/service';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/error-utils';

export interface ServiceCardData {
  id: string;
  service: PublicService;
  teacherName: string;
  teacherAvatar: string | null;
  teacherQualification: string;
  teacherExperience: number;
  teacherBio: string;
  teacherLocation: string;
  teacherEmail: string;
}

export const useTeachers = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedService, setSelectedService] =
    useState<ServiceCardData | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: services = [], isLoading, error: queryError } = useQuery({
    queryKey: ['public-services'],
    queryFn: async () => {
      const apiResponse = await serviceApi.getPublicServices();
      return apiResponse.map(serviceUtils.publicApiResponseToService);
    },
    staleTime: 10 * 60 * 1000, // Keep data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const error = useMemo(() => {
    if (!queryError) return null;
    return getErrorMessage(queryError, 'fetch-public-services');
  }, [queryError]);

  // Convert services to service card data format
  const serviceCards = useMemo(() => {
    return services.map((service) => ({
      id: service.id,
      service,
      teacherName: service.teacherName,
      teacherAvatar: service.teacherAvatar,
      teacherQualification: service.teacherQualification,
      teacherExperience: service.teacherExperience,
      teacherBio: service.teacherBio,
      teacherLocation: service.teacherLocation,
      teacherEmail: service.teacherEmail || '',
    }));
  }, [services]);

  // Get available languages from services
  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    services.forEach((service) => {
      languages.add(service.type === 'language' ? 'Language' : 'Astrology');
    });
    return Array.from(languages).sort();
  }, [services]);

  // Filter services based on search criteria
  const filteredServices = useMemo(() => {
    return serviceCards.filter((serviceCard) => {
      const { service } = serviceCard;

      const matchesSearch =
        service.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.shortDescription
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        service.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesLanguage =
        selectedLanguage === 'all' ||
        (selectedLanguage === 'Language' && service.type === 'language') ||
        (selectedLanguage === 'Astrology' && service.type === 'astrology');

      const matchesPrice =
        service.price >= priceRange[0] && service.price <= priceRange[1];

      return matchesSearch && matchesLanguage && matchesPrice;
    });
  }, [serviceCards, searchQuery, selectedLanguage, priceRange]);

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleLanguageChange = useCallback((value: string) => {
    setSelectedLanguage(value);
  }, []);

  const handlePriceRangeChange = useCallback((value: number[]) => {
    setPriceRange(value);
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setPriceRange([0, 100]);
    setShowFilters(false);
  }, []);

  const refreshTeachers = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['public-services'] });
  }, [queryClient]);

  const handleSelectService = useCallback((serviceCard: ServiceCardData) => {
    setSelectedService(serviceCard);
    setIsDetailsPanelOpen(true);
    setIsModalOpen(true);
  }, []);

  const handleCloseDetailsPanel = useCallback(() => {
    setIsModalOpen(false);
    setSelectedService(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedService(null);
  }, []);

  return {
    // Data
    services: filteredServices,
    availableLanguages,
    isLoading,
    error,

    // Filter states
    searchQuery,
    selectedLanguage,
    priceRange,
    showFilters,

    // Service details panel
    selectedService,
    isDetailsPanelOpen,
    isModalOpen,

    // Handlers
    handleSearchChange,
    handleLanguageChange,
    handlePriceRangeChange,
    handleToggleFilters,
    handleClearFilters,
    handleSelectService,
    handleCloseDetailsPanel,
    handleCloseModal,
    refreshTeachers,
  };
};
