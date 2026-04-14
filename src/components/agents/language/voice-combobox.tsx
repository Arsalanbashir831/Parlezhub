'use client';

import { useState } from 'react';
import { OPENAI_VOICES } from '@/constants/vapi-voices';
import { ChevronDown, Mic2 } from 'lucide-react';

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

type VoiceOption = (typeof OPENAI_VOICES)[number];

type Props = {
  value?: VoiceOption['value'];
  onChange: (value: VoiceOption['value']) => void;
  options?: VoiceOption[];
  placeholder?: string;
  disabled?: boolean;
};

export default function VoiceCombobox({
  value,
  onChange,
  options = OPENAI_VOICES,
  placeholder = 'Select voice',
  disabled = false,
}: Props) {
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
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary-500/20 bg-primary-500/10 text-primary-500 transition-all duration-300 group-hover:bg-primary-500 group-hover:text-primary-950">
              <Mic2 className="h-4 w-4" />
            </div>
            {selected ? (
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-100 transition-colors group-hover:text-primary-300">
                {selected.label}{' '}
                <span className="ml-1 font-medium opacity-40">
                  ({selected.gender})
                </span>
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100/20">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-primary-100/20 transition-colors group-hover:text-primary-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[100] mt-2 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-2xl border-primary-500/10 bg-background/95 p-0 shadow-2xl backdrop-blur-xl">
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Listen to frequencies..."
            className="h-12 border-none bg-white/5 text-white placeholder:text-primary-100/20 focus:ring-0"
          />
          <CommandEmpty className="py-6 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary-100/20">
            No voices found.
          </CommandEmpty>
          <CommandList>
            <CommandGroup className="p-2">
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => {
                    onChange(opt.value as VoiceOption['value']);
                    setOpen(false);
                  }}
                  className="group/item flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:bg-primary-500/10 aria-selected:bg-primary-500/20"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary-100/40 transition-all group-hover/item:border-background/30 group-hover/item:bg-background/20 group-hover/item:text-background/80">
                    <Mic2 className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary-100/60 transition-colors group-hover/item:text-background/80">
                      {opt.label}
                    </span>
                    <span className="text-[9px] font-medium uppercase tracking-wider text-primary-100/20 transition-colors group-hover/item:text-background/60">
                      {opt.gender} frequency
                    </span>
                  </div>
                  {selected?.value === opt.value && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(212,175,55,0.6)] group-hover/item:bg-background/80" />
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
