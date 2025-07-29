'use client';

import { LANGUAGES, NATIVE_LANGUAGES } from '@/constants/ai-session';
import { useSession } from '@/contexts/session-context';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function SessionSummary() {
  const { config } = useSession();
  const selectedLanguage = LANGUAGES.find((l) => l.value === config.language);
  const selectedNativeLanguage = NATIVE_LANGUAGES.find(
    (l) => l.value === config.nativeLanguage
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Ready to Start!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review your session settings below
        </p>
      </div>

      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-semibold">Your Native Language</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedNativeLanguage?.flag}</span>
                <span>{selectedNativeLanguage?.label}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Learning Language</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedLanguage?.flag}</span>
                <span>{selectedLanguage?.label}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Topic</Label>
              <p>{config.topic}</p>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Voice</Label>
              <p className="capitalize">
                {config.gender} • {config.accent}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
          Session Details
        </h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Session duration: 5 minutes</li>
          <li>• You can pause or stop anytime</li>
          <li>• AI will provide real-time feedback</li>
        </ul>
      </div>
    </div>
  );
}
