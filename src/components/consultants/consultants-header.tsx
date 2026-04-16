'use client';

import React from 'react';

interface ConsultantsHeaderProps {
  title?: string;
  description?: string;
}

export const ConsultantsHeader = React.memo<ConsultantsHeaderProps>(
  ({
    title = 'Find Consultants',
    description = 'Connect with qualified language consultants from around the world',
  }) => {
    return (
      <div>
        <h1 className="text-3xl font-bold text-primary-500">{title}</h1>
        <p className="mt-2 text-primary-100/60">{description}</p>
      </div>
    );
  }
);

ConsultantsHeader.displayName = 'ConsultantsHeader';
