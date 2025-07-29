'use client';

import React from 'react';

import { formatTime } from '@/lib/utils';
import { useCurrentTime } from '@/hooks/useCurrentTime';

function CurrentTimeInner() {
  const now = useCurrentTime(1000);
  return <p className="text-2xl font-bold">{formatTime(now)}</p>;
}

// Memo so props changes don't trigger re-render
export const CurrentTime = React.memo(CurrentTimeInner);
