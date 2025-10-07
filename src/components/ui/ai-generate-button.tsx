import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AIGenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  children?: React.ReactNode;
}

export default function AIGenerateButton({
  onClick,
  disabled = false,
  isGenerating = false,
  className,
  size = 'sm',
  variant = 'outline',
  children,
}: AIGenerateButtonProps) {
  const isDisabled = disabled || isGenerating;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isDisabled}
      className={`flex items-center gap-2 ${className || ''}`}
    >
      <Sparkles className="h-3 w-3" />
      {children || (isGenerating ? 'Generating...' : 'Generate with AI')}
    </Button>
  );
}
