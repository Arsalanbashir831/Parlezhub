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
      <div className="relative w-full">
        <Textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={cn(
            'min-h-[44px] resize-none overflow-hidden rounded-2xl pl-6 pr-12 pt-3 focus-visible:ring-1 focus-visible:ring-primary-300',
            inputClassName
          )}
          rows={1}
          style={{ height: '44px' }} // Initial height
        />
        <Button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary-500 p-0 hover:bg-primary-600 disabled:bg-gray-300 disabled:hover:bg-gray-300"
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
