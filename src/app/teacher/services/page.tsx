'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Briefcase, Filter, Plus, Search } from 'lucide-react';

import { Service, ServiceStatus, ServiceType } from '@/types/service';
import { useServices } from '@/hooks/useServices';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ServiceCard,
  ServiceCardSkeleton,
  ServiceDetailsModal,
  ServiceStats,
} from '@/components/services';

export default function ServicesPage() {
  const router = useRouter();
  const {
    services,
    filteredServices,
    stats,
    filters,
    isLoading,
    error,
    deleteExistingService,
    toggleServiceStatus,
    setFilters,
    clearFilters,
    canCreateType,
    refreshServices,
  } = useServices();

  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [serviceToView, setServiceToView] = useState<Service | null>(null);

  // Load services on mount
  useEffect(() => {
    refreshServices();
  }, [refreshServices]);

  const handleCreateService = () => {
    router.push(ROUTES.TEACHER.CREATE_SERVICE);
  };

  const handleViewService = (service: Service) => {
    setServiceToView(service);
  };

  const handleCloseModal = () => {
    setServiceToView(null);
  };

  const handleEditService = (service: Service) => {
    router.push(ROUTES.TEACHER.EDIT_SERVICE(service.id));
  };

  const handleDeleteService = (service: Service) => {
    setDeleteServiceId(service.id);
  };

  const confirmDelete = async () => {
    if (!deleteServiceId) return;

    setIsDeleting(true);
    try {
      await deleteExistingService(deleteServiceId);
      // Success toast is handled by the hook
    } catch {
      // Error toast is handled by the hook
    } finally {
      setIsDeleting(false);
      setDeleteServiceId(null);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    const newStatus: ServiceStatus =
      service.status === 'active' ? 'inactive' : 'active';

    try {
      await toggleServiceStatus(service.id, newStatus);
      // Success toast is handled by the hook
    } catch {
      // Error toast is handled by the hook
    }
  };

  const getAvailableServiceTypes = (): ServiceType[] => {
    const allTypes: ServiceType[] = ['language', 'astrology'];
    return allTypes.filter((type) => canCreateType(type));
  };

  const availableServiceTypes = getAvailableServiceTypes();

  if (error) {
    return (
      <div className="space-y-8">
        <div className="py-12 text-center">
          <p className="mb-4 text-red-600">Error loading services: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">My Services</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your service offerings and track performance
          </p>
        </div>

        <div className="flex gap-3">
          {availableServiceTypes.length > 0 && (
            <Button onClick={handleCreateService}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Service
            </Button>
          )}
          {availableServiceTypes.length === 0 && (
            <div className="text-sm text-gray-500">
              All service types created
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <ServiceStats stats={stats} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={filters.searchQuery || ''}
                  onChange={(e) => setFilters({ searchQuery: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                setFilters({
                  type: value === 'all' ? undefined : (value as ServiceType),
                })
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="language">Language Consultation</SelectItem>
                <SelectItem value="astrology">Astrology Reading</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters({
                  status:
                    value === 'all' ? undefined : (value as ServiceStatus),
                })
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Pause</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onView={handleViewService}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
              onToggleStatus={handleToggleStatus}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No services found</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {filters.searchQuery || filters.type || filters.status
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first service to start offering your expertise.'}
            </p>
            {availableServiceTypes.length > 0 && (
              <Button onClick={handleCreateService}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Service
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteServiceId}
        onOpenChange={() => setDeleteServiceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service? This action cannot
              be undone. All associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={serviceToView}
        isOpen={!!serviceToView}
        onClose={handleCloseModal}
        onEdit={handleEditService}
      />
    </div>
  );
}
