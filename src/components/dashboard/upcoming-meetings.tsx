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
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
            <Link href={ROUTES.STUDENT.MEETINGS}>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:text-primary-700"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={meeting.teacherAvatar || '/placeholders/avatar.jpg'}
                />
                <AvatarFallback className="bg-primary-100 font-semibold text-primary-700 dark:bg-primary-800 dark:text-primary-200">
                  {meeting.teacherName
                    ? meeting.teacherName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    : 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {meeting.subject}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  with {meeting.teacherName || 'Teacher'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatDate(meeting.date)}
                </p>
              </div>
            </div>
          ))}
          <Link href={ROUTES.STUDENT.MEETINGS}>
            <Button variant="outline" className="mt-4 w-full bg-transparent">
              View All Meetings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
