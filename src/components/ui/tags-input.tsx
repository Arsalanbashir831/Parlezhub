'use client';

import { KeyboardEvent, useCallback, useState } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export default function TagsInput({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  className,
  maxTags = 10,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim().toLowerCase();

      if (!trimmedTag) return;
      if (value.includes(trimmedTag)) return;
      if (value.length >= maxTags) return;

      onChange([...value, trimmedTag]);
      setInputValue('');
    },
    [value, onChange, maxTags]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
        e.preventDefault();
        removeTag(value[value.length - 1]);
      }
    },
    [inputValue, value, addTag, removeTag]
  );

  const handleInputBlur = useCallback(() => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  }, [inputValue, addTag]);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex min-h-[48px] flex-wrap gap-2 rounded-xl border border-primary-500/10 bg-white/5 p-3 focus-within:ring-1 focus-within:ring-primary-500/30">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 bg-primary-500/20 text-primary-500 border-primary-500/20 px-2 py-1"
          >
            <span className="text-xs font-bold uppercase tracking-wider">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 rounded-full p-0.5 hover:bg-primary-500/20"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {value.length < maxTags && (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            placeholder={value.length === 0 ? placeholder : ''}
            className="h-auto min-w-[120px] flex-1 border-none bg-transparent p-0 text-sm italic text-white placeholder:text-primary-100/20 shadow-none focus-visible:ring-0"
          />
        )}
      </div>

      <p className="mt-2 ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
        Press Enter or comma to add tags. {value.length}/{maxTags} tags
      </p>
    </div>
  );
}
