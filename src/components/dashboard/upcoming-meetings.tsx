'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ArrowRight } from 'lucide-react';

import { formatDate } from '@/lib/utils';
import { Meeting } from '@/hooks/useMeetings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
}

export default function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  const now = new Date();
  const upcomingMeetings = meetings
    .filter((m) => m.status === 'CONFIRMED' && new Date(m.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="lg:col-span-6">
      <Card className="h-full rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-xl font-bold text-primary-500">
              Upcoming Meetings
            </CardTitle>
            <Link href={ROUTES.STUDENT.MEETINGS}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full p-0 text-primary-500 hover:bg-white/5 hover:text-primary-400"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-8 pt-4">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all duration-300 hover:bg-white/[0.08] hover:shadow-lg"
              >
                {/* Gold side-accent on hover */}
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary-500 opacity-0 shadow-[2px_0_15px_rgba(212,175,55,0.4)] transition-opacity duration-300 group-hover:opacity-100" />

                <Avatar className="h-12 w-12 border-2 border-primary-500/20 transition-colors group-hover:border-primary-500">
                  <AvatarImage
                    src={meeting.teacherAvatar || '/placeholders/avatar.jpg'}
                  />
                  <AvatarFallback className="bg-primary-500/10 font-bold text-primary-500">
                    {meeting.teacherName
                      ? meeting.teacherName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                      : 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold tracking-tight text-white transition-colors group-hover:text-primary-300">
                    {meeting.subject}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary-400">
                      WITH {meeting.teacherName || 'TEACHER'}
                    </p>
                    <span className="text-[10px] text-primary-500/20">•</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-100/30 transition-colors group-hover:text-primary-100/40">
                      {formatDate(meeting.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-100/20">
                No scheduled alignments found
              </p>
            </div>
          )}

          <Link href={ROUTES.STUDENT.MEETINGS}>
            <Button
              variant="outline"
              className="mt-4 h-12 w-full rounded-2xl border-primary-500/10 bg-transparent text-[10px] font-bold uppercase tracking-widest text-primary-500 transition-all hover:bg-primary-500/10 active:scale-95"
            >
              View All Meetings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
