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
  deleteExistingService: (serviceId: string) => Promise<boolean>;
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
}

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [filters, setFiltersState] = useState<ServiceFilters>({});
  const [isLoading, setIsLoading] = useState(false); // Changed to false since we don't auto-load
  const [error, setError] = useState<string | null>(null);

  // Remove automatic loading on mount - let components decide when to load
  // useEffect(() => {
  //   refreshServices();
  // }, []);

  // Create new service
  const createNewService = useCallback(
    async (formData: ServiceFormData): Promise<Service> => {
      try {
        setIsLoading(true);
        setError(null);

        // Convert form data to API request format
        const apiRequest = serviceUtils.formDataToApiRequest(formData);

        // Call API to create service
        const apiResponse = await serviceApi.createService(apiRequest);

        // Convert API response to frontend format
        const newService = serviceUtils.apiResponseToService(apiResponse);

        // Add to local state
        setServices((prev) => [...prev, newService as Service]);

        // Show success toast
        toast.success('Service Created Successfully!', {
          description: 'Your new service has been created and is now active.',
        });

        return newService as Service;
      } catch (err) {
        const errorMessage = getErrorMessage(err, 'service-creation');
        setError(errorMessage);
        toast.error('Failed to Create Service', {
          description: errorMessage,
        });
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update existing service
  const updateExistingService = useCallback(
    async (
      serviceId: string,
      updates: Partial<ServiceFormData>
    ): Promise<Service | null> => {
      try {
        setIsLoading(true);
        setError(null);

        // Convert updates to API request format
        const apiRequest = serviceUtils.formDataToApiRequest(
          updates as ServiceFormData
        );

        // Call API to update service
        const apiResponse = await serviceApi.updateService(
          serviceId,
          apiRequest
        );

        // Convert API response to frontend format
        const updatedService = serviceUtils.apiResponseToService(apiResponse);

        // Update local state
        setServices((prev) =>
          prev.map((s) =>
            s.id === serviceId ? (updatedService as Service) : s
          )
        );

        // Show success toast
        toast.success('Service Updated Successfully!', {
          description: 'Your service has been updated.',
        });

        return updatedService as Service;
      } catch (err) {
        const errorMessage = getErrorMessage(err, 'service-update');
        setError(errorMessage);
        toast.error('Failed to Update Service', {
          description: errorMessage,
        });
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Delete service
  const deleteExistingService = useCallback(
    async (serviceId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        // Call API to delete service
        await serviceApi.deleteService(serviceId);

        // Remove from local state
        setServices((prev) => prev.filter((s) => s.id !== serviceId));

        // Show success toast
        toast.success('Service Deleted Successfully!', {
          description: 'Your service has been permanently deleted.',
        });

        return true;
      } catch (err) {
        const errorMessage = getErrorMessage(err, 'service-deletion');
        setError(errorMessage);
        toast.error('Failed to Delete Service', {
          description: errorMessage,
        });
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Toggle service status
  const toggleServiceStatus = useCallback(
    async (
      serviceId: string,
      status: ServiceStatus
    ): Promise<Service | null> => {
      try {
        setError(null);

        // Convert status to API format
        const apiStatus = status === 'active' ? 'active' : 'inactive';

        // Call API to update service status
        await serviceApi.updateServiceStatus(serviceId, apiStatus);

        // Fetch the full service details after status update
        const fullServiceResponse = await serviceApi.getServiceById(serviceId);
        const updatedService =
          serviceUtils.apiResponseToService(fullServiceResponse);

        // Update local state
        setServices((prev) =>
          prev.map((s) =>
            s.id === serviceId ? (updatedService as Service) : s
          )
        );

        // Show success toast
        const statusText = status === 'active' ? 'activated' : 'deactivated';
        toast.success(`Service ${statusText}!`, {
          description: `Your service has been ${statusText}.`,
        });

        return updatedService as Service;
      } catch (err) {
        const errorMessage = getErrorMessage(err, 'service-status-update');
        setError(errorMessage);
        toast.error('Failed to Update Service Status', {
          description: errorMessage,
        });
        throw new Error(errorMessage);
      }
    },
    []
  );

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
  const canCreateType = useCallback((type: ServiceType): boolean => {
    return true; // For now, allow creating any service type
  }, []);

  // Get single service
  const getService = useCallback(
    async (serviceId: string): Promise<Service | null> => {
      // First try to find in local state
      const localService = services.find((s) => s.id === serviceId);
      if (localService) {
        return localService;
      }

      console.error('Service not found in local state, fetching from API...');
      // If not found locally, fetch from API
      try {
        const apiResponse = await serviceApi.getServiceById(serviceId);
        const fetchedService = serviceUtils.apiResponseToService(apiResponse);

        // Add to local state for future use
        setServices((prev) => {
          const exists = prev.some((s) => s.id === serviceId);
          if (!exists) {
            return [...prev, fetchedService as Service];
          }
          return prev;
        });

        return fetchedService as Service;
      } catch (error) {
        console.error('Failed to fetch service by ID:', error);
        return null;
      }
    },
    [services]
  );

  // Load individual service (for edit pages)
  const loadService = useCallback(
    async (serviceId: string): Promise<Service | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const service = await getService(serviceId);
        return service;
      } catch (error) {
        const errorMessage = getErrorMessage(error, 'fetch-service');
        setError(errorMessage);
        toast.error('Failed to Load Service', {
          description: errorMessage,
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  // Refresh services
  const refreshServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API to get services
      const apiResponse = await serviceApi.getServices();

      // Convert API responses to frontend format
      const servicesList = (apiResponse.results || []).map(
        serviceUtils.apiResponseToService
      );

      // Update local state
      setServices(servicesList as Service[]);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'fetch-services');
      setError(errorMessage);
      toast.error('Failed to Load Services', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    services,
    filteredServices,
    stats,
    filters,
    isLoading,
    error,

    // Actions
    createNewService,
    updateExistingService,
    deleteExistingService,
    toggleServiceStatus,

    // Filters
    setFilters,
    clearFilters,

    // Utilities
    canCreateType,
    getService,
    loadService,
    refreshServices,
  };
}
