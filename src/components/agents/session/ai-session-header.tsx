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
  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      className="flex-shrink-0 justify-self-start text-gray-700 hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
      onClick={onBackClick}
    >
      <ArrowLeft className="h-4 w-4 text-gray-700 hover:text-black dark:text-white sm:mr-2" />
      <span className="hidden sm:inline">{backButtonText}</span>
    </Button>
  );

  return (
    <div className="w-full border-b border-gray-200 bg-white/50 text-black backdrop-blur-sm dark:border-gray-700 dark:bg-black/20 dark:text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 lg:p-6">
        {/* Left side - Back button */}
        <div className="w-1/3 flex-shrink-0">
          {showBackButton &&
            !sessionActive &&
            (onBackClick ? (
              <BackButton />
            ) : (
              <Link href={backButtonHref}>
                <BackButton />
              </Link>
            ))}
        </div>

        {/* Center content - Timer */}
        <div className="flex w-full flex-1 justify-end">{children}</div>

        {/* Right side - Controls */}
        {rightContent && (
          <div className="w-full flex-shrink-0 md:w-1/3">
            <div className="flex flex-col items-stretch justify-end gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
              {rightContent}
            </div>
          </div>
        )}
      </div>
      {/* Bottom Content */}
      {bottomContent && (
        <div className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 sm:pt-0">
          <div className="flex w-full justify-center md:flex-1">
            {bottomContent}
          </div>
        </div>
      )}
    </div>
  );
}
