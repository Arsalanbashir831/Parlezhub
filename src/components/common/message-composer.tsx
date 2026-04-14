'use client';

import { KeyboardEvent, memo, useCallback, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  inputClassName?: string;
}

const MessageComposer = memo(
  ({
    value,
    onChange,
    onSend,
    disabled = false,
    inputClassName,
  }: MessageComposerProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const autoResize = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        // Reset height to calculate new height
        textarea.style.height = 'auto';

        // Calculate new height based on scroll height
        const newHeight = Math.min(
          Math.max(textarea.scrollHeight, 44), // Minimum 44px
          128 // Maximum 128px (max-h-32)
        );

        textarea.style.height = `${newHeight}px`;
      }
    }, []);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !disabled) {
          e.preventDefault();
          onSend();
        }
      },
      [onSend, disabled]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        // Auto-resize after content change
        setTimeout(autoResize, 0);
      },
      [onChange, autoResize]
    );

    // Auto-resize when value changes externally
    useEffect(() => {
      autoResize();
    }, [value, autoResize]);

    return (
      <div className="group relative w-full">
        <Textarea
          ref={textareaRef}
          placeholder="Whisper to the stars..."
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={cn(
            'min-h-[48px] resize-none overflow-hidden rounded-2xl border-primary-500/20 bg-white/[0.03] pl-6 pr-14 pt-3.5 text-primary-100 transition-all duration-300 placeholder:text-primary-100/30 focus-visible:ring-primary-500/30',
            inputClassName
          )}
          rows={1}
          style={{ height: '48px' }} // Initial height
        />
        <Button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="absolute bottom-1.5 right-1.5 h-9 w-9 rounded-full bg-primary-500 p-0 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-90 disabled:bg-primary-500/10 disabled:text-primary-500/30"
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

MessageComposer.displayName = 'MessageComposer';

export default MessageComposer;
