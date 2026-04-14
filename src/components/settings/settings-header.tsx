'use client';

import { memo } from 'react';

interface SettingsHeaderProps {
  title: string;
  description: string;
}

const SettingsHeader = memo(({ title, description }: SettingsHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-500">{title}</h1>
      <p className="mt-2 text-primary-100/60">{description}</p>
    </div>
  );
});

SettingsHeader.displayName = 'SettingsHeader';

export default SettingsHeader;
