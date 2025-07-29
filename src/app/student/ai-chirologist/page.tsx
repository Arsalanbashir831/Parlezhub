'use client';

import { useRouter } from 'next/navigation';
import { DEFAULT_CHIROLOGIST_SESSION_CONFIG } from '@/constants/ai-chirologist-session';
import { ROUTES } from '@/constants/routes';

import { saveSessionConfig } from '@/lib/ai-session-utils';
import { useAIChirologist } from '@/hooks/useAIChirologist';
import {
  ChirologistActions,
  ChirologistConfiguration,
  ChirologistPreview,
} from '@/components/ai-chirologist';

export default function AIChirologistPage() {
  const router = useRouter();
  const { settings, updateTempSetting } = useAIChirologist();

  const handleStartSession = () => {
    // Save chirologist session config before navigating
    saveSessionConfig(DEFAULT_CHIROLOGIST_SESSION_CONFIG);
    router.push(ROUTES.AI_SESSION.SETUP);
  };

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary-500 sm:h-24 sm:w-24 lg:h-32 lg:w-32"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl lg:text-3xl">
          AI Chirologist
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
          Configure and start your personalized palm reading session
        </p>
      </div>

      {/* AI Chirologist Configuration */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        {/* Chirologist Configuration */}
        <div className="order-2 xl:order-1">
          <ChirologistConfiguration
            settings={settings}
            onSettingChange={updateTempSetting}
          />
        </div>

        {/* Session Preview */}
        <div className="order-1 space-y-4 sm:space-y-6 xl:order-2">
          <ChirologistPreview settings={settings} />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <ChirologistActions onStartSession={handleStartSession} />
      </div>
    </div>
  );
}
