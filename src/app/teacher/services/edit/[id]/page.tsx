'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft } from 'lucide-react';

import { Service, ServiceFormData } from '@/types/service';
import { useServices } from '@/hooks/useServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceForm, ServiceFormSkeleton } from '@/components/services';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const { updateExistingService, loadService, isLoading, error } =
    useServices();
  const [service, setService] = useState<Service | null>(null);
  const [serviceNotFound, setServiceNotFound] = useState(false);
  const [isLoadingService, setIsLoadingService] = useState(true);

  useEffect(() => {
    const loadServiceData = async () => {
      if (serviceId) {
        setIsLoadingService(true);
        setServiceNotFound(false);

        try {
          const foundService = await loadService(serviceId);
          if (foundService) {
            setService(foundService);
          } else {
            setServiceNotFound(true);
          }
        } catch (error) {
          console.error('Error loading service:', error);
          setServiceNotFound(true);
        } finally {
          setIsLoadingService(false);
        }
      }
    };

    loadServiceData();
  }, [serviceId, loadService]);

  const handleSubmit = async (data: ServiceFormData) => {
    if (!service) return;

    try {
      await updateExistingService(service.id, data);
      // Success toast is handled by the hook
      router.push(ROUTES.TEACHER.SERVICES);
    } catch (error) {
      // Error toast is handled by the hook
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.TEACHER.SERVICES);
  };

  if (serviceNotFound) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="mb-2 text-lg font-medium">Service Not Found</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              The service you&rsquo;re trying to edit doesn&rsquo;t exist or may
              have been deleted.
            </p>
            <Button onClick={handleCancel}>Back to Services</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingService || !service) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
        </div>

        <ServiceFormSkeleton />
      </div>
    );
  }

  // Convert Service to ServiceFormData
  const initialData: Partial<ServiceFormData> = {
    type: service.type,
    title: service.title,
    description: service.description,
    shortDescription: service.shortDescription,
    price: service.price,
    duration: service.duration,
    tags: service.tags,
    whatYouProvide: service.whatYouProvide,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Edit Service</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update your service offering details
        </p>
      </div>

      {/* Form */}
      <ServiceForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        error={error}
        mode="edit"
        availableTypes={[service.type]} // Only allow current type when editing
      />
    </div>
  );
}
