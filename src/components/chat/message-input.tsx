'use client';

import { memo } from 'react';

import MessageComposer from '../common/message-composer';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  draftFiles?: File[];
  onAddFiles?: (files: FileList) => void;
  onRemoveFile?: (index: number) => void;
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
    isSending = false,
  }: MessageInputProps) => {
    return (
      <div className="border-t border-primary-500/10 bg-background/80 p-6 backdrop-blur-xl">
        <MessageComposer
          value={value}
          onChange={onChange}
          onSend={onSend}
          disabled={disabled}
          draftFiles={draftFiles}
          onAddFiles={onAddFiles}
          onRemoveFile={onRemoveFile}
          isSending={isSending}
        />
      </div>
    );
  }
);

MessageInput.displayName = 'MessageInput';

export default MessageInput;
