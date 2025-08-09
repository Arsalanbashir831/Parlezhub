'use client';

import { CalendarIcon, MessageSquare, TrendingUp } from 'lucide-react';

import { Meeting } from '@/hooks/useMeetings';
import { Card, CardContent } from '@/components/ui/card';
import { ConversationData } from '@/components/history/conversation-card';

interface DashboardStatsProps {
  conversations: ConversationData[];
  meetings: Meeting[];
}

export default function DashboardStatsCards({
  conversations,
  meetings,
}: DashboardStatsProps) {
  const totalConversations = conversations.length;
  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'CONFIRMED'
  ).length;

  return (
    <>
      {/* Total Conversations Card */}
      <div className="lg:col-span-6">
        <Card className="h-full border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-blue-500 p-3">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Conversations
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {totalConversations}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                +3 from last week
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings Card */}
      <div className="lg:col-span-6">
        <Card className="h-full border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-purple-500 p-3">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Upcoming Meetings
              </p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {upcomingMeetings}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Next: Tomorrow 3:00 PM
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
