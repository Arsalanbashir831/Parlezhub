import Link from 'next/link';
// import ToggleThemeBtn from "../common/toggle-theme-btn";
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type Props = {
  children: React.ReactNode;
  backButtonText?: string;
  backButtonHref?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
};

export default function AiSessionHeader({
  children,
  backButtonText = 'Back to AI Tutor',
  backButtonHref = ROUTES.AGENT.LANGUAGE,
  showBackButton = true,
  onBackClick,
}: Props) {
  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      className="flex-shrink-0 text-gray-700 hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
      onClick={onBackClick}
    >
      <ArrowLeft className="h-4 w-4 text-gray-700 hover:text-black dark:text-white sm:mr-2" />
      <span className="hidden sm:inline">{backButtonText}</span>
    </Button>
  );

  return (
    <div className="w-full border-b border-gray-200 bg-white/50 text-black backdrop-blur-sm dark:border-gray-700 dark:bg-black/20 dark:text-white">
      <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6">
        {/* Left side - Back button */}
        {showBackButton &&
          (onBackClick ? (
            <BackButton />
          ) : (
            <Link href={backButtonHref}>
              <BackButton />
            </Link>
          ))}

        {/* Center content - responsive container */}
        <div className="flex flex-1 justify-center sm:px-4">{children}</div>

        {/* Right side - User profile and theme toggle */}
        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
          {/* <ToggleThemeBtn className="hover:bg-black/5 h-8 w-8 sm:h-10 sm:w-10" /> */}

          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-black/5 px-2 py-1 backdrop-blur-sm dark:border-white/20 dark:bg-white/10 sm:gap-3 sm:px-3 sm:py-2 lg:px-4">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
              <AvatarImage src="/placeholder-avatar.png" />
              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-xs sm:block sm:text-sm">
              <p className="font-medium text-gray-900 dark:text-white">
                John Doe
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Student
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
