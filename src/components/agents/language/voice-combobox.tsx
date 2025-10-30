'use client';

import { OPENAI_VOICES } from '@/constants/vapi-voices';

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
  return (
    <select
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-gray-600"
      value={value}
      onChange={(e) => onChange(e.target.value as VoiceOption['value'])}
      disabled={disabled}
    >
      {!value && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {`${opt.label} (${opt.gender === 'male' ? 'male' : 'female'})`}
        </option>
      ))}
    </select>
  );
}
