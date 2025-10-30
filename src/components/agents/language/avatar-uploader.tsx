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
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value || '/placeholders/avatar.jpg'}
          alt="Agent avatar"
          className="h-full w-full object-cover"
        />
      </div>
      <button
        type="button"
        onClick={handleSelect}
        disabled={disabled}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-white/5"
      >
        {value ? 'Change Avatar' : 'Upload Avatar'}
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
