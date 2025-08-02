'use client';

import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  Award,
  Globe,
  MapPin,
  MessageCircle,
  Star,
  Timer,
  Users,
} from 'lucide-react';

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

import { TeacherData } from './teacher-card';

interface TeacherDetailsModalProps {
  teacher: TeacherData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherDetailsModal = React.memo<TeacherDetailsModalProps>(
  ({ teacher, isOpen, onClose }) => {
    if (!teacher) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Teacher Profile</DialogTitle>
            </div>

            {/* Teacher Header */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={teacher.avatar || '/placeholders/avatar.jpg'}
                  />
                  <AvatarFallback className="bg-primary-100 text-lg text-primary-700">
                    {teacher.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                {teacher.isOnline && (
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{teacher.name}</h2>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{teacher.rating}</span>
                    <span className="text-gray-500">
                      ({teacher.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{teacher.location}</span>
                  {teacher.isOnline && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Online now
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Price and Availability */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary-600">
                    ${teacher.hourlyRate}
                  </p>
                  <p className="text-sm text-gray-500">per hour</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{teacher.availability}</p>
                  <p className="text-xs text-gray-500">{teacher.timezone}</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <Users className="mx-auto mb-1 h-5 w-5 text-primary-600" />
                <p className="text-lg font-bold">{teacher.completedLessons}</p>
                <p className="text-xs text-gray-500">Lessons completed</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <Award className="mx-auto mb-1 h-5 w-5 text-primary-600" />
                <p className="text-lg font-bold">{teacher.experience}</p>
                <p className="text-xs text-gray-500">Experience</p>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Globe className="h-4 w-4" />
                Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {teacher.languages.map((language) => (
                  <Badge
                    key={language}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div>
              <h3 className="mb-3 font-semibold">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {teacher.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="outline"
                    className="px-3 py-1"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="mb-3 font-semibold">About</h3>
              <p className="leading-relaxed text-gray-700">
                {teacher.description}
              </p>
            </div>

            {/* Response Time */}
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {teacher.responseTime}
                </span>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3 pb-6">
              <Link
                href={ROUTES.STUDENT.CHAT + '?teacher=' + teacher.id}
                className="block"
              >
                <Button className="w-full" size="lg">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Start Chatting
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

TeacherDetailsModal.displayName = 'TeacherDetailsModal';
