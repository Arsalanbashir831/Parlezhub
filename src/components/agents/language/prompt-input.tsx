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
      <div className="group transition-all duration-500">
        <MessageComposer
          value={value}
          onChange={onChange}
          onSend={onSend}
          disabled={disabled}
        />
        <p className="mt-4 text-center text-[9px] font-bold uppercase tracking-[0.25em] text-primary-100/20 transition-colors duration-500 group-focus-within:text-primary-500/40">
          Command Enter to Transmit &bull; Shift Enter for New Lineage
        </p>
      </div>
    );
  }
);

PromptInput.displayName = 'PromptInput';

export default PromptInput;
