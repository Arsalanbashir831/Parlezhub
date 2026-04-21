'use client';

import { ServiceCardData } from '@/hooks/useConsultants';

import { ServiceCard } from './service-card';
import { cn } from '@/lib/utils';

interface ServicesGridProps {
  services: ServiceCardData[];
  onSelectService: (serviceCard: ServiceCardData) => void;
  className?: string;
}

export function ServicesGrid({ services, onSelectService, className }: ServicesGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
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
