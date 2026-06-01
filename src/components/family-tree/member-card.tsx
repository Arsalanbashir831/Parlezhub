import React from 'react';
import { Calendar, MapPin, Edit3, Link2, Trash2, UserPlus, CheckCircle2 } from 'lucide-react';
import { FamilyMember } from '@/types/family-tree';
import { cn } from '@/lib/utils';
import {
  CARD_DIMENSIONS,
  getInitials,
  getGenderAvatarClasses,
  getGenderBarClasses,
  getGenderCardClasses,
} from '@/lib/family-tree-utils';

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
  /** Optional relationType lets callers pre-select the relation in the creation dialog. */
  onAddRelativeClick: (relationType?: 'spouse' | 'child' | 'parent') => void;
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
    onAddRelativeClick,
  }: MemberCardProps) => {
    const initials = getInitials(member.name);

    return (
      <div
        className={cn(
          'node-card absolute rounded-2xl border bg-background/90 p-3 shadow-xl transition-all duration-300',
          'cursor-pointer select-none group/node flex flex-col justify-between',
          'hover:shadow-2xl hover:-translate-y-0.5 overflow-hidden',
          isTarget && 'ring-2 ring-primary-500 border-primary-500 scale-105 shadow-primary-500/10',
          isSource && 'ring-2 ring-primary-400 border-primary-400 animate-pulse',
          isLinking && !isSource && 'hover:ring-2 hover:ring-primary-500 hover:border-primary-500',
          !isTarget && !isSource && getGenderCardClasses(member.gender)
        )}
        style={{
          left: x,
          top: y,
          width: `${CARD_DIMENSIONS.width}px`,
          height: `${CARD_DIMENSIONS.height}px`,
        }}
        onClick={(e) => {
          // Prevent card click from firing when action buttons are pressed
          if ((e.target as HTMLElement).closest('button')) return;
          onCardClick();
        }}
      >
        {/* Gender accent bar */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-[3.5px] rounded-t-2xl pointer-events-none',
            getGenderBarClasses(member.gender)
          )}
        />

        {/* Card content row */}
        <div className="flex items-center gap-3 w-full flex-1 min-h-0 pt-1">
          {/* Initials avatar */}
          <div
            className={cn(
              'h-12 w-12 rounded-full border flex items-center justify-center shrink-0',
              'font-serif text-sm font-black shadow-inner tracking-wider',
              'transition-transform duration-300 group-hover/node:scale-105',
              getGenderAvatarClasses(member.gender)
            )}
          >
            {initials}
          </div>

          {/* Name & metadata column */}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="truncate text-xs font-extrabold text-primary-100 group-hover/node:text-primary-400 transition-colors">
                {member.name || 'Unnamed'}
              </p>
              {member.is_connected && (
                <span title="Linked Platform Account">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary-500 shrink-0 drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]" />
                </span>
              )}
            </div>

            <div className="flex flex-col gap-0.5 mt-1">
              {member.birth_date && (
                <span className="flex items-center gap-1.5 text-[8.5px] font-bold text-primary-100/40 uppercase">
                  <Calendar className="h-2.5 w-2.5 text-primary-500/50" />
                  {member.birth_date}
                </span>
              )}
              {member.birth_place && (
                <span className="flex items-center gap-1.5 text-[8.5px] font-bold text-primary-100/40 uppercase truncate">
                  <MapPin className="h-2.5 w-2.5 text-primary-500/50" />
                  {member.birth_place}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action bar — only visible when not in linking mode */}
        <div
          className={cn(
            'flex items-center gap-2 border-t border-primary-500/10 pt-1.5 mt-1.5',
            'opacity-0 group-hover/node:opacity-100 transition-opacity duration-300 shrink-0',
            isLinking && 'hidden'
          )}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEditClick(); }}
            title="Edit member details"
            className="flex items-center justify-center p-1 rounded-md bg-white/5 text-primary-300 hover:bg-white/10 hover:text-primary-100 transition-colors"
          >
            <Edit3 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddRelativeClick(); }}
            title="Add relative member"
            className="flex items-center justify-center p-1 rounded-md bg-white/5 text-primary-300 hover:bg-white/10 hover:text-primary-100 transition-colors"
          >
            <UserPlus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onLinkClick(); }}
            title="Connect relationship"
            className="flex items-center justify-center p-1 rounded-md bg-white/5 text-primary-300 hover:bg-white/10 hover:text-primary-100 transition-colors"
          >
            <Link2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
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
