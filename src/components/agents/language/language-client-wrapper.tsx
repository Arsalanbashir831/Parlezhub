'use client';

// import { useConsultants } from '@/hooks/useConsultants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MainContent } from '@/components/agents/language/main-content';

// import { ServiceDetailsModal, ServicesList } from '@/components/consultants';

export function LanguageClientWrapper() {
  // const {
  //   services,
  //   selectedService,
  //   isModalOpen,
  //   handleCloseModal,
  //   handleSelectService,
  // } = useConsultants();

  return (
    <div className="relative flex flex-1 bg-background selection:bg-primary-500/30">
      <ScrollArea className="h-[calc(100vh-4rem)] w-3/4 flex-1">
        <MainContent />
      </ScrollArea>
      {/* <ScrollArea className="hidden h-[calc(100vh-4rem)] max-w-[350px] border-l border-primary-500/10 bg-background/50 backdrop-blur-xl p-6 lg:block">
        <div className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-100/40 ml-1">
            Linguistic Services
          </h2>
        </div>
        <ServicesList
          services={services}
          onSelectService={handleSelectService}
        />
      </ScrollArea> */}

      {/* <ServiceDetailsModal
        serviceCard={selectedService}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      /> */}
    </div>
  );
}
