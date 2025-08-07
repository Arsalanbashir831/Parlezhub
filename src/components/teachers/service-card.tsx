'use client';

import React from 'react';
import { ChevronRight, Clock, DollarSign, MapPin, Tag } from 'lucide-react';

import {
  getServiceStatusColor,
  getServiceTypeLabel,
} from '@/lib/service-utils';
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
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
        onClick={handleSelectService}
      >
        <CardContent className="p-4">
          {/* Teacher Info */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={teacherAvatar || '/placeholders/avatar.jpg'}
                  />
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {teacherName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">
                  {teacherName}
                </h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {teacherLocation || 'Location not specified'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Service Info */}
          <div className="space-y-3">
            {/* Service Type and Status */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getServiceTypeLabel(service.type)}
              </Badge>
              <Badge
                className={`text-xs ${getServiceStatusColor(service.status)}`}
              >
                {service.status}
              </Badge>
            </div>

            {/* Service Title */}
            <div>
              <h4 className="mb-1 line-clamp-2 text-base font-semibold">
                {service.title}
              </h4>
              <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {service.shortDescription}
              </p>
            </div>

            {/* Service Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration}min</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-lg font-semibold">
                <DollarSign className="h-4 w-4" />
                {service.price}
              </div>
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {service.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
                {service.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{service.tags.length - 3} more
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
