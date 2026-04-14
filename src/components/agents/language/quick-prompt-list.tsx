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
    <div className="mb-8 flex flex-wrap items-center justify-center gap-2 md:gap-4">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className="group flex items-center space-x-2 rounded-2xl border-primary-500/10 bg-white/5 px-5 py-6 text-primary-100/60 shadow-lg transition-all duration-300 hover:border-primary-500/30 hover:bg-primary-500/10 hover:text-primary-300 active:scale-95"
          onClick={() => onQuickActionClick?.(action.prompt)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary-500/20 bg-primary-500/10 text-primary-500 transition-colors group-hover:bg-primary-500 group-hover:text-primary-950">
            <action.icon className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {action.label}
          </span>
        </Button>
      ))}
    </div>
  );
}
