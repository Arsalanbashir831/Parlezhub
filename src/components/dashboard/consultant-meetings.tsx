'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ArrowRight, CalendarIcon } from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';
import { Meeting } from '@/hooks/useMeetings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConsultantMeetingsProps {
  meetings: Meeting[];
}

export default function ConsultantMeetings({ meetings }: ConsultantMeetingsProps) {
  const upcomingMeetings = meetings
    .filter((m) => m.status === 'CONFIRMED')
    .slice(0, 5)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="lg:col-span-12">
      <Card className="h-full rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-2xl font-bold text-primary-500">Your Students & Sessions</CardTitle>
            <Link href={ROUTES.TEACHER.MEETINGS}>
              <Button
                variant="ghost"
                size="sm"
                className="group flex h-10 items-center gap-2 rounded-xl border border-primary-500/10 bg-white/5 px-4 text-[10px] font-bold uppercase tracking-widest text-primary-400 transition-all hover:bg-primary-500/10 hover:text-primary-300"
              >
                View All
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting) => (
              <Link
                href={ROUTES.TEACHER.MEETINGS}
                key={meeting.id}
                className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300 hover:bg-white/[0.05] hover:shadow-xl"
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-primary-500/10 transition-colors group-hover:border-primary-500">
                    <AvatarImage
                      src={meeting.studentAvatar || '/placeholders/avatar.jpg'}
                    />
                    <AvatarFallback className="bg-primary-500/10 font-serif text-lg font-bold text-primary-500">
                      {meeting.studentName
                        ? meeting.studentName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                        : 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-primary-950 bg-green-500 shadow-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="truncate font-serif text-lg font-bold text-white transition-colors group-hover:text-primary-500">
                      {meeting.subject}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary-100/40">
                      with {meeting.studentName || 'Student'}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary-100/30">
                      <span>{formatDate(meeting.date)}</span>
                      <span className="h-1 w-1 rounded-full bg-primary-100/20" />
                      <span>{meeting.duration}min</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      meeting.status === 'CONFIRMED' ? 'default' : 'secondary'
                    }
                    className={cn(
                      'rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-widest',
                      meeting.status === 'CONFIRMED'
                      ? 'border-primary-500/20 bg-primary-500/10 text-primary-500'
                      : 'border-white/10 bg-white/5 text-primary-100/40'
                    )}
                  >
                    {meeting.status === 'CONFIRMED' ? 'Upcoming' : 'Cancelled'}
                  </Badge>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-primary-100/20">
                <CalendarIcon className="h-8 w-8" />
              </div>
              <p className="font-serif text-lg font-bold text-primary-100/40">
                No upcoming sessions
              </p>
            </div>
          )}
          <Link href={ROUTES.TEACHER.MEETINGS}>
            <Button
              variant="outline"
              className="mt-4 h-12 w-full rounded-2xl border-primary-500/10 bg-transparent text-[10px] font-bold uppercase tracking-widest text-primary-500 transition-all hover:bg-primary-500/10 active:scale-95"
            >
              View All Sessions
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
