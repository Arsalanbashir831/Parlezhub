'use client';

import { CalendarIcon, TrendingUp } from 'lucide-react';

import { Meeting } from '@/hooks/useMeetings';
import { Card, CardContent } from '@/components/ui/card';

interface TeacherStatsCardsProps {
  meetings: Meeting[];
}

export default function TeacherStatsCards({
  meetings,
}: TeacherStatsCardsProps) {
  const totalMeetings = meetings.length;
  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'CONFIRMED'
  ).length;
  const completedMeetings = meetings.filter((m) => m.status === 'CONFIRMED');

  // Calculate average rating from completed meetings
  const averageRating =
    completedMeetings.length > 0
      ? completedMeetings.reduce((sum, m) => sum + (m.rating || 0), 0) /
      completedMeetings.length
      : 0;

  return (
    <>
      {/* Average Rating Card */}
      {/* <div className="lg:col-span-6">
        <Card className="h-full border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-yellow-500 p-3">
                <Star className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Average Rating
              </p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                {averageRating.toFixed(1)}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Based on {completedMeetings.length} reviews
              </p>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Upcoming Meetings Card */}
      <div className="lg:col-span-6">
        <Card className="h-full border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-primary-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary-500/80">
                Upcoming Sessions
              </p>
              <p className="text-3xl font-bold text-white">
                {upcomingMeetings}
              </p>
              <p className="text-xs text-slate-500">
                Next: Tomorrow 3:00 PM
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
