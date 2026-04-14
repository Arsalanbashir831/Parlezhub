import Link from 'next/link';
// import ToggleThemeBtn from "../common/toggle-theme-btn";
import { ROUTES } from '@/constants/routes';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
  children: React.ReactNode;
  backButtonText?: string;
  backButtonHref?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  sessionActive?: boolean;
  rightContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
};

export default function AiSessionHeader({
  children,
  backButtonText = 'Back to AI Tutor',
  backButtonHref = ROUTES.STUDENT.DASHBOARD,
  showBackButton = true,
  onBackClick,
  sessionActive = false,
  rightContent,
  bottomContent,
}: Props) {
  return (
    <div className="relative z-50 w-full border-b border-primary-500/10 bg-background/80 text-white backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 lg:p-6 lg:px-8">
        {/* Left side - Back button */}
        <div className="min-w-0 flex-1">
          {showBackButton &&
            !sessionActive &&
            (onBackClick ? (
              <Button
                variant="ghost"
                size="sm"
                className="group flex items-center gap-2 rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest text-primary-100/40 transition-all hover:bg-white/5 hover:text-primary-500"
                onClick={onBackClick}
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">{backButtonText}</span>
              </Button>
            ) : (
              <Link href={backButtonHref}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group flex items-center gap-2 rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest text-primary-100/40 transition-all hover:bg-white/5 hover:text-primary-500"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span className="hidden sm:inline">{backButtonText}</span>
                </Button>
              </Link>
            ))}
        </div>

        {/* Center content - Timer */}
        <div className="flex flex-1 justify-center">{children}</div>

        {/* Right side - Controls */}
        <div className="flex flex-1 justify-end">
          {rightContent && (
            <div className="flex flex-col items-stretch justify-end gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
              {rightContent}
            </div>
          )}
        </div>
      </div>
      {/* Bottom Content */}
      {bottomContent && (
        <div className="flex flex-col items-center justify-center gap-2 p-6 pt-0 duration-500 animate-in fade-in slide-in-from-top-2">
          <div className="flex w-full justify-center md:flex-1">
            {bottomContent}
          </div>
        </div>
      )}
    </div>
  );
}
