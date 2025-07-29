'use client';

import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  studentName?: string;
  teacherName?: string;
  type: 'lesson' | 'consultation';
}

interface MeetingTabsProps {
  meetings: Meeting[];
  userRole: 'student' | 'teacher';
  onJoinMeeting?: (meetingId: string) => void;
  onCancelMeeting?: (meetingId: string) => void;
  onRescheduleMeeting?: (meetingId: string) => void;
}

export default function MeetingTabs({
  meetings,
  userRole,
  onJoinMeeting,
  onCancelMeeting,
  onRescheduleMeeting,
}: MeetingTabsProps) {
  const handleTabChange = (value: string) => {
    // Handle tab change logic here
    console.log('Tab changed to:', value);
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'upcoming');
  const completedMeetings = meetings.filter(m => m.status === 'completed');
  const cancelledMeetings = meetings.filter(m => m.status === 'cancelled');

  const getStatusIcon = (status: Meeting['status']) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Meeting['status']) => {
    const variants = {
      upcoming: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const renderMeetingCard = (meeting: Meeting) => (
    <Card key={meeting.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(meeting.status)}
            <CardTitle className="text-lg">{meeting.title}</CardTitle>
          </div>
          {getStatusBadge(meeting.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{meeting.date} at {meeting.time}</span>
            <span>({meeting.duration} min)</span>
          </div>

          {userRole === 'student' && meeting.teacherName && (
            <p className="text-sm text-gray-600">
              Teacher: {meeting.teacherName}
            </p>
          )}

          {userRole === 'teacher' && meeting.studentName && (
            <p className="text-sm text-gray-600">
              Student: {meeting.studentName}
            </p>
          )}

          {meeting.status === 'upcoming' && (
            <div className="flex gap-2 pt-2">
              {onJoinMeeting && (
                <Button size="sm" onClick={() => onJoinMeeting(meeting.id)}>
                  Join Meeting
                </Button>
              )}
              {onRescheduleMeeting && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRescheduleMeeting(meeting.id)}
                >
                  Reschedule
                </Button>
              )}
              {onCancelMeeting && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onCancelMeeting(meeting.id)}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="upcoming" onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upcoming">
          Upcoming ({upcomingMeetings.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed ({completedMeetings.length})
        </TabsTrigger>
        <TabsTrigger value="cancelled">
          Cancelled ({cancelledMeetings.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="mt-6">
        {upcomingMeetings.length > 0 ? (
          upcomingMeetings.map(renderMeetingCard)
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No upcoming meetings</h3>
              <p className="text-gray-600">
                Schedule a meeting to get started with your language learning journey.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="completed" className="mt-6">
        {completedMeetings.length > 0 ? (
          completedMeetings.map(renderMeetingCard)
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No completed meetings</h3>
              <p className="text-gray-600">
                Your completed meetings will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="cancelled" className="mt-6">
        {cancelledMeetings.length > 0 ? (
          cancelledMeetings.map(renderMeetingCard)
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No cancelled meetings</h3>
              <p className="text-gray-600">
                Cancelled meetings will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
