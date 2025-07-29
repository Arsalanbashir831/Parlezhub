'use client';

import React from 'react';

interface TeachersHeaderProps {
  title?: string;
  description?: string;
}

export const TeachersHeader = React.memo<TeachersHeaderProps>(
  ({
    title = 'Find Teachers',
    description = 'Connect with qualified language teachers from around the world',
  }) => {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
    );
  }
);

TeachersHeader.displayName = 'TeachersHeader';
