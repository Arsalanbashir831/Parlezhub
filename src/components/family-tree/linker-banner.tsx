'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamilyMember } from '@/types/family-tree';

interface LinkerBannerProps {
  linkingSource: FamilyMember | null;
  onCancel: () => void;
}

export const LinkerBanner = React.memo(({ linkingSource, onCancel }: LinkerBannerProps) => {
  if (!linkingSource) return null;

  return (
    <div className="relative z-20 flex items-center justify-between bg-primary-500/10 border-b border-primary-500/20 px-6 py-3.5 backdrop-blur-md shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-primary-500 animate-ping" />
        <p className="text-xs font-bold text-primary-400">
          Linking Mode Active: Choose relative to connect to{' '}
          <span className="text-primary-300 font-extrabold">
            {"\""}{linkingSource.name}{"\""}
          </span>
        </p>
      </div>
      <Button
        variant="ghost"
        onClick={onCancel}
        className="flex h-8 items-center gap-1 text-[10px] uppercase font-black bg-white/5 px-2.5 py-1.5 rounded-lg text-primary-300 hover:bg-destructive hover:text-white transition-colors cursor-pointer"
      >
        <X className="h-3 w-3" />
        Cancel Linking
      </Button>
    </div>
  );
});

LinkerBanner.displayName = 'LinkerBanner';
