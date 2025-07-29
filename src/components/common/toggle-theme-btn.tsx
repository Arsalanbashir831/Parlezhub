import { useTheme } from '@/contexts/theme-context';
import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

type Props = {
  className?: string;
};

export default function ToggleThemeBtn({ className }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn('hover:bg-gray-100 dark:hover:bg-gray-700', className)}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
