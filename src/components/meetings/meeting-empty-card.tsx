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
    <Card className="py-12 text-center">
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-gray-600">{description}</p>
          </div>
          {showButton && (
            <Link href={ROUTES.STUDENT.TEACHERS}>
              <Button className="bg-primary-500 hover:bg-primary-600">
                Find Teachers
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
