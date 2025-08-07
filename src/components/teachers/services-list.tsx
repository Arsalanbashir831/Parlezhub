'use client';

import { ServiceCardData } from '@/hooks/useTeachers';

import { ServiceCard } from './service-card';

interface ServicesListProps {
  services: ServiceCardData[];
  onSelectService: (serviceCard: ServiceCardData) => void;
}

export function ServicesList({ services, onSelectService }: ServicesListProps) {
  return (
    <div className="flex flex-col gap-4">
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
