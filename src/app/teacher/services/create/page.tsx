'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft } from 'lucide-react';

import { ServiceFormData, ServiceType } from '@/types/service';
import { useServices } from '@/hooks/useServices';
import { Button } from '@/components/ui/button';
import { ServiceForm } from '@/components/services';

export default function CreateServicePage() {
  const router = useRouter();
  const { createNewService, canCreateType, isProcessing, error } = useServices();

  const getAvailableServiceTypes = (): ServiceType[] => {
    const allTypes: ServiceType[] = ['language', 'astrology', 'general'];
    return allTypes.filter((type) => canCreateType(type));
  };

  const availableTypes = getAvailableServiceTypes();

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      await createNewService(data);
      router.push(ROUTES.TEACHER.SERVICES);
    } catch (error) {
      console.error('Service creation failed:', error);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.TEACHER.SERVICES);
  };

  if (availableTypes.length === 0) {
    router.push(ROUTES.TEACHER.SERVICES);
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2 h-12 rounded-xl border-primary-500/10 bg-white/5 text-white transition-all hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold font-serif text-primary-500">Create New Service</h1>
        <p className="mt-2 text-primary-100/60 font-medium">
          Set up your service offering and start earning from your expertise
        </p>
      </div>

      {/* Form */}
      <ServiceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isProcessing}
        error={error}
        mode="create"
        availableTypes={availableTypes}
      />
    </div>
  );
}
