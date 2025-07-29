'use client';

import { ROUTES } from '@/constants/routes';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ServiceForm } from '@/components/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useServices } from '@/hooks/useServices';
import { Service, ServiceFormData } from '@/types/service';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const { updateExistingService, getService, isLoading } = useServices();
  const [service, setService] = useState<Service | null>(null);
  const [serviceNotFound, setServiceNotFound] = useState(false);

  useEffect(() => {
    if (serviceId) {
      const foundService = getService(serviceId);
      if (foundService) {
        setService(foundService);
      } else {
        setServiceNotFound(true);
      }
    }
  }, [serviceId, getService]);

  const handleSubmit = async (data: ServiceFormData) => {
    if (!service) return;

    try {
      const updatedService = await updateExistingService(service.id, data);
      if (updatedService) {
        toast({
          title: 'Success!',
          description: 'Your service has been updated successfully.',
        });
        router.push(ROUTES.TEACHER.SERVICES);
      } else {
        throw new Error('Failed to update service');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update service. Please try again.',
        variant: 'destructive',
      });
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
              The service you&rsquo;re trying to edit doesn&rsquo;t exist or may have been
              deleted.
            </p>
            <Button onClick={handleCancel}>Back to Services</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!service) {
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
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading service details...
            </p>
          </CardContent>
        </Card>
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
        mode="edit"
        availableTypes={[service.type]} // Only allow current type when editing
      />
    </div>
  );
}
