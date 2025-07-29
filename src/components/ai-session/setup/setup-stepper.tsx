'use client';

import { CHIROLOGIST_SETUP_STEPS } from '@/constants/ai-chirologist-session';
import { SETUP_STEPS } from '@/constants/ai-session';
import { useSession } from '@/contexts/session-context';
import { Check } from 'lucide-react';

interface SetupStepperProps {
  currentStep: number;
}

export default function SetupStepper({ currentStep }: SetupStepperProps) {
  const { config } = useSession();
  const isChirologistSession = config.sessionType === 'chirologist';
  const steps = isChirologistSession ? CHIROLOGIST_SETUP_STEPS : SETUP_STEPS;

  return (
    <div className="mb-6 flex items-center justify-center px-4 sm:mb-8 sm:px-0">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 sm:h-10 sm:w-10 lg:h-12 lg:w-12 ${
              index <= currentStep
                ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800'
            }`}
          >
            {index < currentStep ? (
              <Check className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            ) : (
              <step.icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mx-1 h-0.5 w-6 transition-all duration-300 sm:mx-2 sm:w-12 md:w-16 lg:w-20 ${
                index < currentStep
                  ? 'bg-primary-500 shadow-sm shadow-primary-500/20'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
