import { quickLanguagePrompts } from '@/constants/quick-prompts';

import { Button } from '@/components/ui/button';

interface QuickPromptListProps {
  quickActions: typeof quickLanguagePrompts;
  onQuickActionClick?: (prompt: string) => void;
}

export function QuickPromptList({
  quickActions,
  onQuickActionClick,
}: QuickPromptListProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-2 md:gap-3">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className="flex items-center space-x-2 rounded-full p-2 text-xs md:p-3 md:text-sm"
          onClick={() => onQuickActionClick?.(action.prompt)}
        >
          <action.icon className="h-3 w-3 text-primary-500 md:h-4 md:w-4" />
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
