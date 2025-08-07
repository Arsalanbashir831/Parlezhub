'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Tag,
  User,
} from 'lucide-react';

import { getServiceTypeLabel } from '@/lib/service-utils';
import { ServiceCardData } from '@/hooks/useTeachers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface ServiceDetailsModalProps {
  serviceCard: ServiceCardData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceDetailsModal({
  serviceCard,
  isOpen,
  onClose,
}: ServiceDetailsModalProps) {
  if (!serviceCard) return null;

  const {
    service,
    teacherName,
    teacherAvatar,
    teacherQualification,
    teacherExperience,
    teacherBio,
    teacherLocation,
  } = serviceCard;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-sm overflow-y-auto rounded-lg md:max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {getServiceTypeLabel(service.type)}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold leading-tight">
                {service.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Teacher Information */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-semibold">About the Teacher</h3>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={teacherAvatar || '/placeholders/avatar.jpg'}
                />
                <AvatarFallback className="bg-primary-100 text-lg text-primary-700">
                  {teacherName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-semibold">{teacherName}</h4>
                  {teacherQualification && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {teacherQualification}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {teacherLocation && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{teacherLocation}</span>
                    </div>
                  )}
                  {teacherExperience > 0 && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{teacherExperience}+ years experience</span>
                    </div>
                  )}
                </div>
                {teacherBio && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {teacherBio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Service Statistics */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Price per Session
                </p>
                <p className="font-semibold">${service.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Session Duration
                </p>
                <p className="font-semibold">{service.duration} minutes</p>
              </div>
            </div>
          </div>

          {/* Service Description */}
          <div>
            <h3 className="mb-2 text-lg font-semibold">Service Overview</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {service.shortDescription}
            </p>
          </div>

          {/* Detailed Description */}
          <div>
            <h3 className="mb-2 text-lg font-semibold">Detailed Description</h3>
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {service.description}
            </p>
          </div>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* What You Provide */}
          {service.whatYouProvide && service.whatYouProvide.length > 0 && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                What You&rsquo;ll Get
              </h3>
              <ul className="space-y-1">
                {service.whatYouProvide.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Link href={ROUTES.STUDENT.TEACHER_CHAT(service.teacherId)}>
              <Button>Chat</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
