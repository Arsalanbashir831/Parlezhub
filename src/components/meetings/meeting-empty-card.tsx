'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Calendar } from 'lucide-react';

import { useMeetings } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function MeetingEmptyCard() {
  const pathname = usePathname();
  const isTeacher = pathname?.includes('/teacher/');
  const { filteredMeetings, activeTab } = useMeetings();
  if (filteredMeetings.length > 0) return null;

  const getEmptyMessage = () => {
    if (isTeacher) {
      // Teacher-specific messages
      switch (activeTab) {
        case 'upcoming':
          return {
            title: 'No upcoming sessions',
            description: "You don't have any upcoming sessions with students.",
            showButton: false,
          };
        case 'completed':
          return {
            title: 'No completed sessions',
            description: "You haven't completed any teaching sessions yet.",
            showButton: false,
          };
        case 'cancelled':
          return {
            title: 'No cancelled sessions',
            description: "You don't have any cancelled sessions.",
            showButton: false,
          };
        default:
          return {
            title: 'No sessions found',
            description: 'No sessions match your search criteria',
            showButton: false,
          };
      }
    } else {
      // Student-specific messages
      switch (activeTab) {
        case 'upcoming':
          return {
            title: 'No upcoming meetings',
            description:
              "You don't have any upcoming meetings. Book a lesson with a teacher!",
            showButton: true,
          };
        case 'completed':
          return {
            title: 'No completed meetings',
            description:
              "You haven't completed any lessons yet. Start learning with your first session!",
            showButton: true,
          };
        case 'cancelled':
          return {
            title: 'No cancelled meetings',
            description: "You don't have any cancelled meetings.",
            showButton: false,
          };
        default:
          return {
            title: 'No meetings found',
            description: 'No meetings match your search criteria',
            showButton: false,
          };
      }
    }
  };

  const { title, description, showButton } = getEmptyMessage();

  return (
    <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-sm transition-all duration-300">
      <CardContent className="py-20 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 shadow-lg shadow-primary-500/5">
            <Calendar className="h-10 w-10 text-primary-500" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-primary-300">
              {title}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm tracking-wide text-primary-100/40">
              {description}
            </p>
          </div>
          {showButton && (
            <Link href={ROUTES.STUDENT.TEACHERS}>
              <Button className="h-11 rounded-xl bg-primary-500 px-12 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95">
                Find Teachers
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
