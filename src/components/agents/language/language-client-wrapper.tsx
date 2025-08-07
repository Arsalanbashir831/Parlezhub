'use client';

import { useTeachers } from '@/hooks/useTeachers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MainContent } from '@/components/agents/language/main-content';
import { ServiceDetailsModal, ServicesList } from '@/components/teachers';

export function LanguageClientWrapper() {
  const {
    services,
    selectedService,
    isModalOpen,
    handleCloseModal,
    handleSelectService,
  } = useTeachers();

  return (
    <div className="flex flex-1">
      <ScrollArea className="h-[calc(100vh-4rem)] w-3/4 flex-1">
        <MainContent />
      </ScrollArea>
      <ScrollArea className="hidden h-[calc(100vh-4rem)] max-w-[350px] border-l border-gray-200 bg-white p-6 lg:block">
        <ServicesList
          services={services}
          onSelectService={handleSelectService}
        />
      </ScrollArea>

      <ServiceDetailsModal
        serviceCard={selectedService}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
