'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Briefcase, Plus } from 'lucide-react';

import { Service, ServiceStatus, ServiceType } from '@/types/service';
import { useServices } from '@/hooks/useServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, } from '@/components/ui/card';
import {
  ServiceCard,
  ServiceCardSkeleton,
  ServiceDetailsModal,
  ServicesFilters,
  ServiceStats,
} from '@/components/services';
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

export default function ServicesPage() {
  const router = useRouter();
  const {
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
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white">
            My <span className="text-primary-500">Services</span>
          </h1>
          <p className="mt-2 text-primary-100/60 font-medium">
            Manage your service offerings and track performance
          </p>
        </div>

        <div className="flex gap-3">
          {availableServiceTypes.length > 0 && (
            <Button
              onClick={handleCreateService}
              className="h-12 rounded-2xl bg-primary-500 px-8 text-sm font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-primary-600 active:scale-95"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Service
            </Button>
          )}
          {availableServiceTypes.length === 0 && (
            <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm font-medium text-primary-100/40">
              All service types created
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <ServiceStats stats={stats} />

      {/* Filters */}
      <ServicesFilters
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
      />

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
        <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary-500/20 bg-primary-500/10 text-primary-500">
              <Briefcase className="h-10 w-10 text-primary-500" />
            </div>
            <h3 className="mb-2 font-serif text-2xl font-bold text-white">No services found</h3>
            <p className="mb-8 max-w-sm text-primary-100/60 font-medium">
              {filters.searchQuery || filters.type || filters.status
                ? 'Try adjusting your filters to see more results and find what you are looking for.'
                : 'Create your first service to start offering your expertise to your students.'}
            </p>
            {availableServiceTypes.length > 0 && (
              <Button
                onClick={handleCreateService}
                className="h-12 rounded-2xl bg-primary-500 px-8 text-sm font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-primary-600 active:scale-95"
              >
                <Plus className="mr-2 h-5 w-5" />
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
