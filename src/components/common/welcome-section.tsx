import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Plus } from 'lucide-react';

import { Button } from '../ui/button';

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
  buttonLink = ROUTES.AGENT.LANGUAGE,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-primary-600/90 via-primary-500/80 to-primary-700/90 p-10 text-white shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-primary-500/10">
      <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-24 translate-y-24 rounded-full bg-white/5 blur-2xl"></div>
      
      {/* Decorative lines */}
      <div className="absolute left-0 top-0 h-full w-full opacity-10">
        <div className="absolute left-[10%] top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
        <div className="absolute left-[30%] top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
        <div className="absolute left-[50%] top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <h1 className="font-serif text-4xl font-bold tracking-tight lg:text-5xl">
              {title}
            </h1>
            <p className="text-xl font-medium text-primary-100/80 leading-relaxed">
              {subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            {showButton && (
              <Link href={buttonLink}>
                <Button
                  size="lg"
                  className="group h-14 rounded-2xl bg-white px-8 font-serif text-lg font-bold text-primary-600 shadow-xl transition-all hover:scale-105 hover:bg-white/95 active:scale-95"
                >
                  <Plus className="mr-3 h-6 w-6 transition-transform group-hover:rotate-90" />
                  {buttonText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
