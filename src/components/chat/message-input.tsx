'use client';

import { KeyboardEvent, memo, useCallback } from 'react';
import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const MessageInput = memo(
  ({ value, onChange, onSend, disabled = false }: MessageInputProps) => {
    const handleKeyPress = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !disabled) {
          onSend();
        }
      },
      [onSend, disabled]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange]
    );

    return (
      <div className="border-t bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Type a message..."
              value={value}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="pr-10"
            />
          </div>
          <Button
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="bg-primary-500 hover:bg-primary-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);

MessageInput.displayName = 'MessageInput';

export default MessageInput;
