'use client';

import { memo } from 'react';

import MessageComposer from '../common/message-composer';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const MessageInput = memo(
  ({ value, onChange, onSend, disabled = false }: MessageInputProps) => {
    return (
      <div className="border-t border-primary-500/10 bg-background/80 p-6 backdrop-blur-xl">
        <MessageComposer
          value={value}
          onChange={onChange}
          onSend={onSend}
          disabled={disabled}
        />
      </div>
    );
  }
);

MessageInput.displayName = 'MessageInput';

export default MessageInput;
