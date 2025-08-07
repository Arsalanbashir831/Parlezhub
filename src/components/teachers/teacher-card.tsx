'use client';

import React from 'react';
import { PublicService } from '@/services/service';
import { ChevronRight, MapPin, Star } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export interface TeacherData {
  id: string;
  name: string;
  avatar: string;
  languages: string[];
  specialties: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  timezone: string;
  experience: string;
  description: string;
  availability: string;
  isOnline: boolean;
  isFavorite: boolean;
  completedLessons: number;
  responseTime: string;
  calendlyLink: string;
  services?: PublicService[];
}

interface TeacherCardProps {
  teacher: TeacherData;
  onSelectTeacher: (teacher: TeacherData) => void;
}

export const TeacherCard = React.memo<TeacherCardProps>(
  ({ teacher, onSelectTeacher }) => {
    const handleSelectTeacher = React.useCallback(() => {
      onSelectTeacher(teacher);
    }, [teacher, onSelectTeacher]);

    return (
      <Card
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
        onClick={handleSelectTeacher}
      >
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={teacher.avatar || '/placeholders/avatar.jpg'}
                  />
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {teacher.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                {teacher.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">
                  {teacher.name}
                </h3>
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{teacher.rating}</span>
                  <span className="text-xs text-gray-500">
                    ({teacher.reviewCount})
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            {/* Primary Languages */}
            <div className="flex flex-wrap gap-1">
              {teacher.languages.slice(0, 2).map((language) => (
                <Badge
                  key={language}
                  variant="secondary"
                  className="px-2 py-0.5 text-xs"
                >
                  {language}
                </Badge>
              ))}
              {teacher.languages.length > 2 && (
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  +{teacher.languages.length - 2}
                </Badge>
              )}
            </div>

            {/* Location and Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="h-3 w-3" />
                <span className="truncate text-xs">{teacher.location}</span>
              </div>
              <p className="text-sm font-bold text-primary-600">
                ${teacher.hourlyRate}/hr
              </p>
            </div>

            {/* Description Preview */}
            <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
              {teacher.description}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

TeacherCard.displayName = 'TeacherCard';
