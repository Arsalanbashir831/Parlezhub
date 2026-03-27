'use client';

import { Clock, Eye, HandMetal } from 'lucide-react';

import { AIChirologistSettings } from '@/types/ai-chirologist';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ChirologistPreviewProps {
  settings: AIChirologistSettings;
}

export default function ChirologistPreview({
  settings,
}: ChirologistPreviewProps) {
  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandMetal className="h-5 w-5" />
          Session Preview
        </CardTitle>
        <CardDescription>
          Get ready for your palm reading session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Features */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
            <HandMetal className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm font-medium">Palm Reading Analysis</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get insights from your palm lines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
            <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm font-medium">Personalized Insights</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Receive detailed interpretations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium">Future Guidance</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get guidance for your path ahead
              </p>
            </div>
          </div>
        </div>

        {/* Ready to Start */}
        <div className="py-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your AI chirologist <strong>{settings.name}</strong> is ready to
            read your palm!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
