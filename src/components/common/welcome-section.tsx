import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Plus } from 'lucide-react';

import { Button } from '../ui/button';
import { CurrentTime } from './current-time';

type Props = {
  title?: string;
  subtitle?: string;
  showButton?: boolean;
  buttonText?: string;
  buttonLink?: string;
};

export default function WelcomeSection({
  title = 'Welcome back! 👋',
  subtitle = 'Ready to continue your language learning journey?',
  showButton = true,
  buttonText = 'Start AI Session',
  buttonLink = ROUTES.STUDENT.AI_TUTOR,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-8 text-white">
      <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-white/10"></div>
      <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-24 translate-y-24 rounded-full bg-white/5"></div>
      <div className="relative z-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold lg:text-4xl">{title}</h1>
            <p className="text-lg text-primary-100">{subtitle}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            {showButton && (
              <Link href={buttonLink}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white font-semibold text-primary-600 hover:bg-white/90"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {buttonText}
                </Button>
              </Link>
            )}
            <div className="text-right lg:text-left">
              <p className="text-sm text-primary-100">Current Time</p>
              <CurrentTime />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
