'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ArrowRight } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConversationData } from '@/components/history/conversation-card';

interface RecentSessionsProps {
  conversations: ConversationData[];
}

export default function RecentSessions({ conversations }: RecentSessionsProps) {
  return (
    <div className="lg:col-span-6">
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
            <Link href={ROUTES.STUDENT.HISTORY}>
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
          {conversations.slice(0, 5).map((conversation) => (
            <div
              key={conversation.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary-100 font-semibold text-primary-700 dark:bg-primary-800 dark:text-primary-200">
                  {conversation.language.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {conversation.topic}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {conversation.language} • {conversation.duration}m
                </p>
              </div>
            </div>
          ))}
          <Link href={ROUTES.STUDENT.HISTORY}>
            <Button variant="outline" className="mt-4 w-full bg-transparent">
              View All Sessions
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
