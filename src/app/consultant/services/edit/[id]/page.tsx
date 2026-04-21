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
  const { updateExistingService, loadService, isProcessing, error } = useServices();

  const [service, setService] = useState<Service | null>(null);
  const [serviceNotFound, setServiceNotFound] = useState(false);
  const [isLoadingService, setIsLoadingService] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await loadService(serviceId);
        if (!data) {
          setServiceNotFound(true);
        } else {
          setService(data);
        }
      } catch {
        setServiceNotFound(true);
      } finally {
        setIsLoadingService(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId, loadService]);

  const handleSubmit = async (data: ServiceFormData) => {
    if (!service) return;

    try {
      await updateExistingService(service.id, data);
      router.push(ROUTES.TEACHER.SERVICES);
    } catch {
      // Error handled by hook
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
            className="flex items-center gap-2 h-10 rounded-xl border-primary-500/10 bg-white/5 text-white px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
        </div>

        <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md">
          <CardContent className="py-16 text-center">
            <h3 className="mb-2 font-serif text-2xl font-bold text-white">Service Not Found</h3>
            <p className="mb-8 max-w-sm mx-auto text-primary-100/60 font-medium">
              The service you&apos;re trying to edit doesn&apos;t exist or may have been deleted.
            </p>
            <Button
              onClick={handleCancel}
              className="h-12 rounded-xl bg-primary-500 px-8 text-sm font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-primary-600 active:scale-95"
            >
              Back to Services
            </Button>
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
            className="flex items-center gap-2 h-10 rounded-xl border-primary-500/10 bg-white/5 text-white px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
        </div>
        <ServiceFormSkeleton />
      </div>
    );
  }

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
          className="flex items-center gap-2 h-10 rounded-xl border-primary-500/10 bg-white/5 text-white px-4 transition-all hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Button>
      </div>

      <div>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-white">
          Edit <span className="text-primary-500">Service</span>
        </h1>
        <p className="mt-2 text-primary-100/60 font-medium">
          Update your service offering details to reflect your evolving expertise.
        </p>
      </div>

      <ServiceForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isProcessing}
        error={error}
        mode="edit"
        availableTypes={[service.type]}
      />
    </div>
  );
}
