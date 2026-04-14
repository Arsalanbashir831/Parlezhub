'use client';

import React, { useCallback, useRef } from 'react';

type Props = {
  value?: string;
  onChange: (dataUrl: string) => void;
  disabled?: boolean;
};

export default function AvatarUploader({ value, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        if (result) onChange(result);
      };
      reader.readAsDataURL(file);
      // reset input so same file can be reselected
      e.target.value = '';
    },
    [onChange]
  );

  return (
    <div className="group flex items-center gap-4">
      <div className="relative">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-500/0 opacity-20 blur-[2px] transition-opacity duration-500 group-hover:opacity-40" />
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-primary-500/20 bg-white/5 shadow-lg backdrop-blur-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value || '/placeholders/avatar.jpg'}
            alt="Agent avatar"
            className="h-full w-full object-cover brightness-[0.9] filter transition-all duration-500 group-hover:brightness-100"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSelect}
        disabled={disabled}
        className="h-12 rounded-2xl border border-primary-500/10 bg-white/[0.03] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary-100/60 shadow-lg transition-all duration-300 hover:border-primary-500/30 hover:bg-white/[0.08] hover:text-primary-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {value ? 'Reshape Vessel' : 'Summon Avatar'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
