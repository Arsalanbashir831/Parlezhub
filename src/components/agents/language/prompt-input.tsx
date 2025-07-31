'use client';

import { memo } from 'react';

import MessageComposer from '@/components/common/message-composer';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const PromptInput = memo(
  ({ value, onChange, onSend, disabled = false }: PromptInputProps) => {
    return (
      <div>
        <MessageComposer
          value={value}
          onChange={onChange}
          onSend={onSend}
          disabled={disabled}
        />
        <p className="mt-2 text-center text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    );
  }
);

PromptInput.displayName = 'PromptInput';

export default PromptInput;
