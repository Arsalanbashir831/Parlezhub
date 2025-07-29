'use client';

import { Bot, Clock, MessageCircle } from 'lucide-react';

import { AITutorSettings } from '@/types/ai-tutor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TutorPreviewProps {
  settings: AITutorSettings;
}

export default function TutorPreview({ settings }: TutorPreviewProps) {
  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Session Preview
        </CardTitle>
        <CardDescription>
          Get ready for your AI conversation session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Features */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium">Interactive Conversations</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Practice speaking with your AI tutor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium">Real-time Feedback</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get instant corrections and suggestions
              </p>
            </div>
          </div>
        </div>

        {/* Ready to Start */}
        <div className="py-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your AI tutor <strong>{settings.name}</strong> is ready to help you
            practice!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
