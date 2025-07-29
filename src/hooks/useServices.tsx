'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Service,
  ServiceFilters,
  ServiceFormData,
  ServiceStats,
  ServiceStatus,
  ServiceType,
} from '@/types/service';
import {
  canCreateServiceType,
  createService,
  deleteService,
  getServiceById,
  getServicesByTeacher,
  loadServices,
  updateService,
  updateServiceStatus,
} from '@/lib/service-utils';

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
  getService: (serviceId: string) => Service | null;
  refreshServices: () => void;
}

const TEACHER_ID = 'teacher-1'; // Mock teacher ID

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [filters, setFiltersState] = useState<ServiceFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load services on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      const teacherServices = getServicesByTeacher(TEACHER_ID);
      setServices(teacherServices);
      setError(null);
    } catch (err) {
      setError('Failed to load services');
      console.error('Error loading services:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new service
  const createNewService = useCallback(
    async (formData: ServiceFormData): Promise<Service> => {
      try {
        setIsLoading(true);
        const newService = createService(formData, TEACHER_ID);
        setServices((prev) => [...prev, newService]);
        setError(null);
        return newService;
      } catch (err) {
        const errorMessage = 'Failed to create service';
        setError(errorMessage);
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
        const updatedService = updateService(serviceId, updates);
        if (updatedService) {
          setServices((prev) =>
            prev.map((s) => (s.id === serviceId ? updatedService : s))
          );
          setError(null);
        }
        return updatedService;
      } catch (err) {
        const errorMessage = 'Failed to update service';
        setError(errorMessage);
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
        const success = deleteService(serviceId);
        if (success) {
          setServices((prev) => prev.filter((s) => s.id !== serviceId));
          setError(null);
        }
        return success;
      } catch (err) {
        const errorMessage = 'Failed to delete service';
        setError(errorMessage);
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
        const updatedService = updateServiceStatus(serviceId, status);
        if (updatedService) {
          setServices((prev) =>
            prev.map((s) => (s.id === serviceId ? updatedService : s))
          );
          setError(null);
        }
        return updatedService;
      } catch (err) {
        const errorMessage = 'Failed to update service status';
        setError(errorMessage);
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

  // Check if can create service type
  const canCreateType = useCallback((type: ServiceType): boolean => {
    return canCreateServiceType(TEACHER_ID, type);
  }, []);

  // Get single service
  const getService = useCallback((serviceId: string): Service | null => {
    return getServiceById(serviceId);
  }, []);

  // Refresh services
  const refreshServices = useCallback(() => {
    try {
      const teacherServices = getServicesByTeacher(TEACHER_ID);
      setServices(teacherServices);
      setError(null);
    } catch (err) {
      setError('Failed to refresh services');
      console.error('Error refreshing services:', err);
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
    refreshServices,
  };
}
