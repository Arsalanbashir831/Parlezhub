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
  const activeStudents = [...new Set(meetings.map(m => m.studentName))].length;
  const completedCount = meetings.filter(m => m.status === 'CONFIRMED').length;

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-12">
        {/* Total Sessions Card */}
        <Card className="group relative overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-white/[0.05]">
          <div className="absolute -right-4 -top-12 h-24 w-24 rounded-full bg-primary-500/10 blur-3xl transition-all group-hover:bg-primary-500/20" />
          <CardContent className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-500/20 bg-primary-500/10 text-primary-500 shadow-lg shadow-primary-500/10">
                <CalendarIcon className="h-7 w-7" />
              </div>
              <TrendingUp className="h-6 w-6 text-primary-100/20 transition-colors group-hover:text-primary-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-100/40">
                Total Sessions
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="font-serif text-4xl font-bold tracking-tight text-white transition-colors group-hover:text-primary-500">
                  {completedCount}
                </h2>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Students Card */}
        <Card className="group relative overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-white/[0.05]">
          <div className="absolute -right-4 -top-12 h-24 w-24 rounded-full bg-primary-500/10 blur-3xl transition-all group-hover:bg-primary-500/20" />
          <CardContent className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-500/20 bg-primary-500/10 text-primary-500 shadow-lg shadow-primary-500/10">
                <TrendingUp className="h-7 w-7" />
              </div>
              <TrendingUp className="h-6 w-6 text-primary-100/20 transition-colors group-hover:text-primary-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-100/40">
                Total Students
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="font-serif text-4xl font-bold tracking-tight text-white transition-colors group-hover:text-primary-500">
                  {activeStudents}
                </h2>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
