'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ArrowRight } from 'lucide-react';

import { formatDate } from '@/lib/utils';
import { Meeting } from '@/hooks/useMeetings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeacherMeetingsProps {
  meetings: Meeting[];
}

export default function TeacherMeetings({ meetings }: TeacherMeetingsProps) {
  const upcomingMeetings = meetings
    .filter((m) => m.status === 'CONFIRMED')
    .slice(0, 5)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="lg:col-span-12">
      <Card className="h-full rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-primary-500">Your Students & Sessions</CardTitle>
            <Link href={ROUTES.TEACHER.MEETINGS}>
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
        <CardContent className="space-y-4">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting) => (
              <Link
                href={ROUTES.TEACHER.MEETINGS}
                key={meeting.id}
                className="flex cursor-pointer items-center gap-4 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={meeting.studentAvatar || '/placeholders/avatar.jpg'}
                  />
                  <AvatarFallback className="bg-primary-100 font-semibold text-primary-700 dark:bg-primary-800 dark:text-primary-200">
                    {meeting.studentName
                      ? meeting.studentName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                      : 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {meeting.subject}
                    </p>
                    {/* <Badge variant="outline" className="text-xs">
                      {meeting.language}
                    </Badge> */}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    with {meeting.studentName || 'Student'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDate(meeting.date)} • {meeting.duration}min
                  </p>
                </div>
                <div className="text-right">
                  {/* <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${meeting.price}
                  </p> */}
                  <Badge
                    variant={
                      meeting.status === 'CONFIRMED' ? 'default' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {meeting.status === 'CONFIRMED' ? 'Upcoming' : 'Cancelled'}
                  </Badge>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
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
