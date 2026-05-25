'use client';

import React from 'react';
import { Calendar, MapPin, Edit3, Link2, Trash2 } from 'lucide-react';
import { FamilyMember } from '@/types/family-tree';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  member: FamilyMember;
  x: number;
  y: number;
  isTarget: boolean;
  isSource: boolean;
  isLinking: boolean;
  onCardClick: () => void;
  onEditClick: () => void;
  onLinkClick: () => void;
  onDeleteClick: () => void;
}

export const MemberCard = React.memo(
  ({
    member,
    x,
    y,
    isTarget,
    isSource,
    isLinking,
    onCardClick,
    onEditClick,
    onLinkClick,
    onDeleteClick,
  }: MemberCardProps) => {
    const isMale = member.gender === 'male';
    const isFemale = member.gender === 'female';

    return (
      <div
        className={cn(
          'node-card absolute rounded-2xl border bg-background/90 p-4 shadow-xl transition-shadow duration-300 cursor-pointer select-none group/node flex flex-col justify-between',
          isTarget && 'ring-2 ring-primary-500 border-primary-500 scale-105 shadow-primary-500/10',
          isSource && 'ring-2 ring-primary-400 border-primary-400 animate-pulse',
          isLinking && !isSource && 'hover:ring-2 hover:ring-primary-500 hover:border-primary-500',
          !isTarget &&
            !isSource &&
            (isMale
              ? 'border-sky-500/20 hover:border-sky-500/40 hover:shadow-sky-500/5'
              : isFemale
                ? 'border-pink-500/20 hover:border-pink-500/40 hover:shadow-pink-500/5'
                : 'border-white/10 hover:border-white/20')
        )}
        style={{
          left: x,
          top: y,
          width: '220px',
          height: '96px',
        }}
        onClick={onCardClick}
      >
        {/* Card Content */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-primary-100">{member.name}</p>
          <div className="flex flex-wrap gap-x-2 gap-y-1.5 mt-1">
            {member.birth_date && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-primary-100/40 uppercase">
                <Calendar className="h-2.5 w-2.5" />
                {member.birth_date}
              </span>
            )}
            {member.birth_place && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-primary-100/40 uppercase max-w-[100px] truncate">
                <MapPin className="h-2.5 w-2.5" />
                {member.birth_place}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons (only show when not linking) */}
        <div
          className={cn(
            'flex items-center gap-2 border-t border-primary-500/10 pt-1.5 mt-1.5 opacity-0 group-hover/node:opacity-100 transition-opacity duration-300 shrink-0',
            isLinking && 'hidden'
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
            title="Edit member details"
            className="flex items-center justify-center p-1 rounded-md bg-white/5 text-primary-300 hover:bg-white/10 hover:text-primary-100 transition-colors"
          >
            <Edit3 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLinkClick();
            }}
            title="Connect relationship"
            className="flex items-center justify-center p-1 rounded-md bg-white/5 text-primary-300 hover:bg-white/10 hover:text-primary-100 transition-colors"
          >
            <Link2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick();
            }}
            title="Delete member"
            className="flex items-center justify-center p-1 rounded-md bg-white/5 text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors ml-auto"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }
);

MemberCard.displayName = 'MemberCard';
