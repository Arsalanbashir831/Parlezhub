'use client';

import React from 'react';
import { ChevronRight, Clock, MapPin, Tag } from 'lucide-react';

import {
  getServiceStatusColor,
  getServiceTypeLabel,
} from '@/lib/service-utils';
import { cn } from '@/lib/utils';
import { ServiceCardData } from '@/hooks/useTeachers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceCardProps {
  serviceCard: ServiceCardData;
  onSelectService: (serviceCard: ServiceCardData) => void;
}

export const ServiceCard = React.memo<ServiceCardProps>(
  ({ serviceCard, onSelectService }) => {
    const { service, teacherName, teacherAvatar, teacherLocation } =
      serviceCard;

    const handleSelectService = React.useCallback(() => {
      onSelectService(serviceCard);
    }, [serviceCard, onSelectService]);

    return (
      <Card
        className="group relative cursor-pointer overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08] hover:shadow-primary-500/5"
        onClick={handleSelectService}
      >
        {/* Gold side-accent on hover */}
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary-500 opacity-0 shadow-[2px_0_15px_rgba(212,175,55,0.4)] transition-opacity duration-300 group-hover:opacity-100" />

        <CardContent className="relative z-10 p-6">
          {/* Teacher Info */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-primary-500/20 shadow-2xl shadow-primary-500/10 transition-colors group-hover:border-primary-500">
                  <AvatarImage
                    src={teacherAvatar || '/placeholders/avatar.jpg'}
                  />
                  <AvatarFallback className="bg-primary-500/10 font-bold text-primary-500">
                    {teacherName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-primary-950 bg-green-500"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-serif text-base font-bold tracking-tight text-white transition-colors group-hover:text-primary-300">
                  {teacherName}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-100/40 transition-colors group-hover:text-primary-100/60">
                  <MapPin className="h-3.5 w-3.5 text-primary-500/40" />
                  <span className="truncate">
                    {teacherLocation || 'CITIZEN OF EARTH'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-primary-500/40 transition-all group-hover:bg-primary-500/10 group-hover:text-primary-500">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>

          {/* Service Info */}
          <div className="space-y-5">
            {/* Service Type and Status */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary-500/20 bg-primary-500/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary-400"
              >
                {getServiceTypeLabel(service.type)}
              </Badge>
              <Badge
                className={cn(
                  'px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest shadow-sm',
                  getServiceStatusColor(service.status)
                )}
              >
                {service.status}
              </Badge>
            </div>

            {/* Service Title */}
            <div>
              <h4 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-white transition-colors group-hover:text-primary-200">
                {service.title}
              </h4>
              <p className="line-clamp-2 text-sm font-medium text-primary-100/30 transition-colors group-hover:text-primary-100/50">
                {service.shortDescription}
              </p>
            </div>

            {/* Service Stats */}
            <div className="flex items-center justify-between border-t border-white/5 pt-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-100/30 transition-colors group-hover:text-primary-100/50">
                  <Clock className="h-4 w-4 text-primary-500/40" />
                  <span>{service.duration} MIN</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-serif text-xl font-bold text-primary-500">
                <span className="ml-0.5 text-sm opacity-60">$</span>
                {service.price}
              </div>
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {service.tags.slice(0, 2).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="h-6 border border-white/5 bg-white/5 text-[8px] font-bold uppercase tracking-widest text-primary-100/30"
                  >
                    <Tag className="mr-1 h-2.5 w-2.5 opacity-40" />
                    {tag}
                  </Badge>
                ))}
                {service.tags.length > 2 && (
                  <Badge
                    variant="secondary"
                    className="h-6 border border-white/5 bg-white/5 text-[8px] font-bold uppercase tracking-widest text-primary-100/20"
                  >
                    +{service.tags.length - 2} ARCHIVES
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

ServiceCard.displayName = 'ServiceCard';
