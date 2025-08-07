'use client';

import { ServiceCardData } from '@/hooks/useTeachers';

import { ServiceCard } from './service-card';

interface ServicesGridProps {
  services: ServiceCardData[];
  onSelectService: (serviceCard: ServiceCardData) => void;
}

export function ServicesGrid({ services, onSelectService }: ServicesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((serviceCard) => (
        <ServiceCard
          key={serviceCard.id}
          serviceCard={serviceCard}
          onSelectService={onSelectService}
        />
      ))}
    </div>
  );
}
