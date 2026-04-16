'use client';

import { Star } from 'lucide-react';
import { SharedStudentsList } from '@/components/dashboard/shared-students-list';

export default function AstrologyStudentsPage() {
  return (
    <div className="space-y-8">
      <div className="mb-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-white">
              Astro <span className="text-primary-500">Students</span>
            </h1>
            <p className="mt-2 text-primary-100/60 font-medium">
              Manage and access students who have shared their astrological data with you for consultation.
            </p>
          </div>
        </div>
      </div>

      <SharedStudentsList />
    </div>
  );
}
