'use client';

import { useCallback, useMemo, useState } from 'react';
import { serviceApi, serviceUtils } from '@/services/service';
import { toast } from 'sonner';

import {
  Service,
  ServiceFilters,
  ServiceFormData,
  ServiceStats,
  ServiceStatus,
  ServiceType,
} from '@/types/service';
import { getErrorMessage } from '@/lib/error-utils';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface UseServicesReturn {
  services: Service[];
  filteredServices: Service[];
  stats: ServiceStats;
  filters: ServiceFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  createNewService: (formData: ServiceFormData) => Promise<Service>;
  updateExistingService: (
    serviceId: string,
    updates: Partial<ServiceFormData>
  ) => Promise<Service | null>;
  deleteExistingService: (serviceId: string) => Promise<string>;
  toggleServiceStatus: (
    serviceId: string,
    status: ServiceStatus
  ) => Promise<Service | null>;

  // Filters
  setFilters: (filters: Partial<ServiceFilters>) => void;
  clearFilters: () => void;

  // Utilities
  canCreateType: (type: ServiceType) => boolean;
  getService: (serviceId: string) => Promise<Service | null>;
  loadService: (serviceId: string) => Promise<Service | null>;
  refreshServices: () => void;
  isProcessing: boolean;
}

export function useServices(): UseServicesReturn {
  const queryClient = useQueryClient();
  const [filters, setFiltersState] = useState<ServiceFilters>({});

  const {
    data: servicesList = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await serviceApi.getServices();
      return (response.results || []).map(serviceUtils.apiResponseToService) as Service[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const services = servicesList;
  const error = queryError ? getErrorMessage(queryError, 'fetch-services') : null;

  // Remove automatic loading on mount - let components decide when to load
  // useEffect(() => {
  //   refreshServices();
  // }, []);

  const createMutation = useMutation({
    mutationFn: async (formData: ServiceFormData) => {
      const apiRequest = serviceUtils.formDataToApiRequest(formData);
      const apiResponse = await serviceApi.createService(apiRequest);
      return serviceUtils.apiResponseToService(apiResponse) as Service;
    },
    onSuccess: (newService) => {
      queryClient.setQueryData(['services'], (old: Service[] = []) => [
        ...old,
        newService,
      ]);
      toast.success('Service Created Successfully!');
    },
    onError: (err) => {
      toast.error('Failed to Create Service', {
        description: getErrorMessage(err),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ServiceFormData>;
    }) => {
      const apiRequest = serviceUtils.formDataToApiRequest(updates as ServiceFormData);
      const apiResponse = await serviceApi.updateService(id, apiRequest);
      return serviceUtils.apiResponseToService(apiResponse) as Service;
    },
    onSuccess: (updatedService) => {
      queryClient.setQueryData(['services'], (old: Service[] = []) =>
        old.map((s) => (s.id === updatedService.id ? updatedService : s))
      );
      toast.success('Service Updated Successfully!');
    },
    onError: (err) => {
      toast.error('Failed to Update Service', {
        description: getErrorMessage(err),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await serviceApi.deleteService(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['services'], (old: Service[] = []) =>
        old.filter((s) => s.id !== deletedId)
      );
      toast.success('Service Deleted Successfully!');
    },
    onError: (err) => {
      toast.error('Failed to Delete Service', {
        description: getErrorMessage(err),
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ServiceStatus;
    }) => {
      const apiStatus = status === 'active' ? 'active' : 'inactive';
      await serviceApi.updateServiceStatus(id, apiStatus);
      const fullServiceResponse = await serviceApi.getServiceById(id);
      return serviceUtils.apiResponseToService(fullServiceResponse) as Service;
    },
    onSuccess: (updatedService) => {
      queryClient.setQueryData(['services'], (old: Service[] = []) =>
        old.map((s) => (s.id === updatedService.id ? updatedService : s))
      );
      toast.success('Status Updated Successfully!');
    },
    onError: (err) => {
      toast.error('Failed to Update Status', {
        description: getErrorMessage(err),
      });
    },
  });

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (filters.type && service.type !== filters.type) return false;
      if (filters.status && service.status !== filters.status) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [services, filters]);

  // Calculate stats
  const stats = useMemo((): ServiceStats => {
    const activeServices = services.filter((s) => s.status === 'active');
    const totalSessions = services.reduce(
      (sum, s) => sum + (s.totalSessions || 0),
      0
    );
    const totalEarnings = services.reduce(
      (sum, s) => sum + (s.totalSessions || 0) * s.price,
      0
    );

    const servicesWithRatings = services.filter(
      (s) => s.averageRating && s.averageRating > 0
    );
    const averageRating =
      servicesWithRatings.length > 0
        ? servicesWithRatings.reduce(
            (sum, s) => sum + (s.averageRating || 0),
            0
          ) / servicesWithRatings.length
        : 0;

    return {
      totalServices: services.length,
      activeServices: activeServices.length,
      totalSessions,
      totalEarnings,
      averageRating,
    };
  }, [services]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<ServiceFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  // Check if can create service type (simplified logic - can create any type)
  const canCreateType = useCallback((): boolean => {
    return true; // For now, allow creating any service type
  }, []);

  // Get single service
  const getService = useCallback(
    async (serviceId: string): Promise<Service | null> => {
      const localService = services.find((s) => s.id === serviceId);
      if (localService) return localService;

      try {
        const apiResponse = await serviceApi.getServiceById(serviceId);
        return serviceUtils.apiResponseToService(apiResponse) as Service;
      } catch (error) {
        console.error('Failed to fetch service by ID:', error);
        return null;
      }
    },
    [services]
  );

  // Load individual service
  const loadService = useCallback(
    async (serviceId: string): Promise<Service | null> => {
      return getService(serviceId);
    },
    [getService]
  );

  // Refresh services
  const refreshServices = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    services,
    filteredServices,
    stats,
    filters,
    isLoading,
    error,

    // Actions
    createNewService: createMutation.mutateAsync,
    updateExistingService: (id: string, updates: Partial<ServiceFormData>) =>
      updateMutation.mutateAsync({ id, updates }),
    deleteExistingService: deleteMutation.mutateAsync,
    toggleServiceStatus: (id: string, status: ServiceStatus) =>
      statusMutation.mutateAsync({ id, status }),

    // Filters
    setFilters,
    clearFilters,

    // Utilities
    canCreateType,
    getService,
    loadService,
    refreshServices,
    isProcessing:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      statusMutation.isPending,
  };
}

export default useServices;
