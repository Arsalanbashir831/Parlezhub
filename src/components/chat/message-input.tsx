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
      <div className="border-t bg-white p-4">
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
