'use client';

import { Calendar, Clock, Video } from 'lucide-react';

import { useMeetings } from '@/hooks/useMeetings';
import { Card, CardContent } from '@/components/ui/card';

export default function MeetingStats() {
  const { counts, nextUpcomingLabel, totalCompletedHours, userRole } =
    useMeetings();
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Upcoming Meetings Card */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]">
        <div className="absolute -right-4 -top-12 h-24 w-24 rounded-full bg-primary-500/10 blur-3xl" />
        <CardContent className="relative p-7">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-500/80">
                Upcoming Meetings
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-semibold tracking-tighter text-white">
                  {counts.upcoming}
                </h2>
              </div>
              <p className="mt-1 text-[10px] font-medium text-white/40">
                Next: {nextUpcomingLabel}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Meetings Card */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]">
        <div className="absolute -right-4 -top-12 h-24 w-24 rounded-full bg-primary-500/10 blur-3xl" />
        <CardContent className="relative p-7">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-500/80">
                Completed
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-semibold tracking-tighter text-white">
                  {counts.completed}
                </h2>
              </div>
              <p className="mt-1 text-[10px] font-medium text-white/40">
                This month
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Hours Card */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]">
        <div className="absolute -right-4 -top-12 h-24 w-24 rounded-full bg-primary-500/10 blur-3xl" />
        <CardContent className="relative p-7">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-500/80">
                Total Hours
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-semibold tracking-tighter text-white">
                  {totalCompletedHours}h
                </h2>
              </div>
              <p className="mt-1 text-[10px] font-medium text-white/40">
                {userRole === 'student' ? 'Learning time' : 'Teaching time'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500">
              <Video className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
