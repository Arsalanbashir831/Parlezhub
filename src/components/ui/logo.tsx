import Link from 'next/link';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isCollapsed?: boolean;
  href?: string;
}

export function Logo({
  className,
  size = 'md',
  isCollapsed = false,
  href,
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
          <span className="text-sm font-bold text-white">P</span>
        </div>
        <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-primary-400"></div>
      </div>
      {!isCollapsed && (
        <span
          className={cn(
            'font-bold text-gray-900 dark:text-gray-100',
            sizeClasses[size]
          )}
        >
          Parlez<span className="text-primary-500">Hub</span>
        </span>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
