'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function LanguageCombobox({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; flag?: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="group h-12 w-full justify-between rounded-2xl border-primary-500/10 bg-white/[0.03] px-4 text-primary-100/60 shadow-lg transition-all duration-300 hover:border-primary-500/30 hover:bg-white/[0.08]"
          disabled={disabled}
        >
          {selected ? (
            <span className="flex items-center gap-2 font-medium">
              <span className="text-xl drop-shadow-md filter transition-transform group-hover:scale-110">
                {selected.flag}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100 transition-colors group-hover:text-primary-300">
                {selected.label}
              </span>
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100/20">
              {placeholder}
            </span>
          )}
          <div className="flex h-5 w-5 items-center justify-center rounded-lg border border-primary-500/20 bg-primary-500/10 text-primary-500 transition-all group-hover:bg-primary-500 group-hover:text-primary-950">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mt-2 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-2xl border-primary-500/10 bg-background/95 p-0 shadow-2xl backdrop-blur-xl">
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search dialects..."
            className="h-12 border-none bg-white/5 text-white placeholder:text-primary-100/20 focus:ring-0"
          />
          <CommandEmpty className="py-6 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary-100/20">
            No archives found.
          </CommandEmpty>
          <CommandList>
            <CommandGroup className="p-2">
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="group/item flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:bg-primary-500/10 aria-selected:bg-primary-500/20"
                >
                  <span className="text-2xl drop-shadow-sm filter transition-transform group-hover/item:scale-110">
                    {opt.flag}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary-100/60 transition-colors group-hover/item:text-primary-500">
                    {opt.label}
                  </span>
                  {selected?.value === opt.value && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
