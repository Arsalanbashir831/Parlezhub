'use client';

import { createContext, useContext } from 'react';

import { useMeetings } from '@/hooks/useMeetings';

const MeetingsContext = createContext<ReturnType<typeof useMeetings> | null>(
  null
);

export function MeetingsProvider({ children }: { children: React.ReactNode }) {
  const meetings = useMeetings();
  return (
    <MeetingsContext.Provider value={meetings}>
      {children}
    </MeetingsContext.Provider>
  );
}

export function useMeetingsView() {
  const meetings = useContext(MeetingsContext);
  if (!meetings)
    throw new Error('Meetings view must be used inside MeetingsProvider');
  return meetings;
}
