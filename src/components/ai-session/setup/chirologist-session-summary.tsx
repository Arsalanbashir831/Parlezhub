'use client';

import {
  CHIROLOGIST_EXPERIENCE,
  PALM_TYPES,
} from '@/constants/ai-chirologist-session';
import { useSession } from '@/contexts/session-context';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function ChirologistSessionSummary() {
  const { config } = useSession();
  const selectedPalm = PALM_TYPES.find((p) => p.value === config.palmType);
  const selectedExperience = CHIROLOGIST_EXPERIENCE.find(
    (e) => e.value === config.experience
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Ready for Your Reading!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review your palm reading preferences below
        </p>
      </div>

      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Reading Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-semibold">Palm Selection</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤚</span>
                <div>
                  <p className="font-medium">{selectedPalm?.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPalm?.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Reading Focus</Label>
              <p>{config.readingFocus}</p>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Experience Level</Label>
              <div>
                <p className="font-medium">{selectedExperience?.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedExperience?.description}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Session Type</Label>
              <p>Palm Reading Session</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
        <h3 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
          What to Expect
        </h3>
        <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
          <li>• Detailed analysis of your palm lines</li>
          <li>• Personalized insights and interpretations</li>
          <li>• Guidance based on your reading focus</li>
          <li>• Interactive Q&A with your AI chirologist</li>
        </ul>
      </div>
    </div>
  );
}
