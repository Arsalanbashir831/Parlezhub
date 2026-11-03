'use client';

import { memo } from 'react';

import MessageComposer from '../common/message-composer';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  draftFiles?: File[];
  onAddFiles?: (files: FileList | File[]) => void;
  onRemoveFile?: (index: number) => void;
  onTyping?: () => void;
  isSending?: boolean;
}

const MessageInput = memo(
  ({
    value,
    onChange,
    onSend,
    disabled = false,
    draftFiles = [],
    onAddFiles,
    onRemoveFile,
    onTyping,
    isSending = false,
  }: MessageInputProps) => {
    return (
      <div className="shrink-0 border-t border-border bg-card px-4 py-3 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <MessageComposer
            value={value}
            onChange={onChange}
            onSend={onSend}
            disabled={disabled}
            draftFiles={draftFiles}
            onAddFiles={onAddFiles}
            onRemoveFile={onRemoveFile}
            onTyping={onTyping}
            isSending={isSending}
          />
        </div>
      </div>
    );
  }
);

MessageInput.displayName = 'MessageInput';

export default MessageInput;
