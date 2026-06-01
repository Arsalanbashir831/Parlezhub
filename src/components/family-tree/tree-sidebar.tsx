'use client';

import React, { useMemo } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Heart,
  Baby,
  Users,
  Edit3,
  UserPlus,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { FamilyMember, FamilyRelationship } from '@/types/family-tree';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  getInitials,
  getGenderAvatarClassesLarge,
  getGenderGlowClass,
  getGenderBadgeClasses,
  getGenderBorderClasses,
  getRelationLabel,
} from '@/lib/family-tree-utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TreeSidebarProps {
  member: FamilyMember | null;
  onClose: () => void;
  nodes: FamilyMember[];
  edges: FamilyRelationship[];
  onNavigateToMember: (member: FamilyMember) => void;
  onEditClick: (member: FamilyMember) => void;
  onAddRelativeClick: (member: FamilyMember) => void;
  onDeleteClick: (uuid: string) => void;
}

// ---------------------------------------------------------------------------
// Relation-group section (internal helper component)
// ---------------------------------------------------------------------------

interface RelationGroupProps {
  list: FamilyMember[];
  label: string;
  icon: React.ReactNode;
  role: 'parent' | 'child' | 'spouse';
  onNavigate: (m: FamilyMember) => void;
}

const RelationGroup = ({ list, label, icon, role, onNavigate }: RelationGroupProps) => (
  <div className="space-y-2.5">
    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary-500/80 tracking-widest">
      {icon} {label}
    </span>
    {list.length === 0 ? (
      <p className="text-xs italic text-primary-100/30 pl-1">
        No {label.toLowerCase()} links registered.
      </p>
    ) : (
      <div className="grid grid-cols-1 gap-2">
        {list.map((rel) => (
          <button
            key={rel.id}
            type="button"
            onClick={() => onNavigate(rel)}
            className={cn(
              'flex items-center justify-between px-4 py-2.5 rounded-xl border text-left',
              'text-xs font-semibold text-primary-200 bg-white/[0.01]',
              'transition-all hover:bg-primary-500/5 group/link active:scale-[0.98]',
              getGenderBorderClasses(rel.gender)
            )}
          >
            <span className="truncate group-hover/link:text-primary-400 transition-colors">
              {rel.name}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary-500/60 group-hover/link:text-primary-400/80">
              {getRelationLabel(role, rel.gender)} &rarr;
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export const TreeSidebar = React.memo(
  ({
    member,
    onClose,
    nodes,
    edges,
    onNavigateToMember,
    onEditClick,
    onAddRelativeClick,
    onDeleteClick,
  }: TreeSidebarProps) => {
    // Derive all relationships for the active member
    const { parents, spouses, children } = useMemo(() => {
      if (!member) return { parents: [], spouses: [], children: [] };
      const id = member.id;

      const parentIds = edges
        .filter((e) => e.from_id === id && e.type === 'parent')
        .map((e) => e.to_id);

      const spouseIds = edges
        .filter((e) => e.type === 'spouse' && (e.from_id === id || e.to_id === id))
        .map((e) => (e.from_id === id ? e.to_id : e.from_id));

      const childIds = edges
        .filter((e) => e.to_id === id && e.type === 'parent')
        .map((e) => e.from_id);

      return {
        parents: nodes.filter((n) => parentIds.includes(n.id)),
        spouses: nodes.filter((n) => spouseIds.includes(n.id)),
        children: nodes.filter((n) => childIds.includes(n.id)),
      };
    }, [member, nodes, edges]);

    if (!member) return null;

    const initials = getInitials(member.name);

    return (
      <div className="absolute top-0 right-0 h-full w-[360px] md:w-[420px] bg-background/95 border-l border-primary-500/10 backdrop-blur-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-[99999999]">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-primary-500/10">
          <div className="flex items-center gap-2">
            {/* h-4/w-4 are valid Tailwind sizes (#16 fix) */}
            <Sparkles className="h-4 w-4 text-primary-500 drop-shadow-[0_0_6px_rgba(212,175,55,0.3)] animate-pulse" />
            <h3 className="font-serif text-lg font-bold text-primary-100">Member Details</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 text-primary-300 hover:bg-white/10 hover:text-primary-100 transition-colors"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
          {/* Bio card */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-primary-500/5 relative overflow-hidden group">
            {/* Soft glow */}
            <div
              className={cn(
                'absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 transition-opacity duration-500 pointer-events-none',
                getGenderGlowClass(member.gender)
              )}
            />

            {/* Large avatar */}
            <div
              className={cn(
                'h-24 w-24 rounded-full border-2 flex items-center justify-center',
                'font-serif text-2xl font-black shadow-2xl tracking-wider mb-4 shrink-0',
                'transition-transform duration-300 group-hover:scale-105',
                getGenderAvatarClassesLarge(member.gender)
              )}
            >
              {initials}
            </div>

            {/* Name + verified badge */}
            <div className="flex items-center justify-center gap-1.5 mb-1 max-w-full">
              <h2 className="text-xl font-extrabold text-primary-100 truncate max-w-[280px]">
                {member.name || 'Unnamed'}
              </h2>
              {member.is_connected && (
                <span title="Linked Platform Account">
                  <CheckCircle2 className="h-5 w-5 text-primary-500 shrink-0 drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]" />
                </span>
              )}
            </div>

            {/* Gender pill */}
            <span
              className={cn(
                'text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border',
                getGenderBadgeClasses(member.gender)
              )}
            >
              {member.gender || 'unspecified'}
            </span>

            {/* Linked account banner */}
            {member.is_connected && member.connected_user_details && (
              <div className="mt-4 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-primary-500/5 border border-primary-500/10 text-left">
                <CheckCircle2 className="h-4 w-4 text-primary-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-primary-500/60 uppercase tracking-wider">
                    Linked Member Account
                  </p>
                  <p className="text-xs font-semibold text-primary-200 truncate">
                    {member.connected_user_details.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Birth profile */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-primary-300 border-b border-primary-500/5 pb-2 uppercase tracking-wider">
              Birth Profile
            </h4>
            <div className="grid grid-cols-1 gap-3.5">
              {[
                { icon: <Calendar className="h-4 w-4 text-primary-500/70" />, label: 'Birth Date', value: member.birth_date },
                { icon: <Clock className="h-4 w-4 text-primary-500/70" />, label: 'Birth Time', value: member.birth_time },
                { icon: <MapPin className="h-4 w-4 text-primary-500/70" />, label: 'Birth Place', value: member.birth_place },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.01] border border-primary-500/5 hover:bg-white/[0.02] transition-colors"
                >
                  {icon}
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-primary-100/40 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-primary-200 truncate">{value || 'Not specified'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generational links */}
          <div className="space-y-6">
            <h4 className="font-serif text-sm font-bold text-primary-300 border-b border-primary-500/5 pb-2 uppercase tracking-wider">
              Generational Links
            </h4>
            <RelationGroup
              list={parents}
              label="Parents"
              icon={<Users className="h-3.5 w-3.5 text-primary-500/70" />}
              role="parent"
              onNavigate={onNavigateToMember}
            />
            <RelationGroup
              list={spouses}
              label="Spouses"
              icon={<Heart className="h-3.5 w-3.5 text-pink-500/70" />}
              role="spouse"
              onNavigate={onNavigateToMember}
            />
            <RelationGroup
              list={children}
              label="Children"
              icon={<Baby className="h-3.5 w-3.5 text-primary-500/70" />}
              role="child"
              onNavigate={onNavigateToMember}
            />
          </div>
        </div>

        {/* ── Action footer — uses shadcn Button (#15 fix) ── */}
        <div className="px-6 py-5 border-t border-primary-500/10 bg-white/[0.01] flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => onEditClick(member)}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border-primary-500/15 bg-white/5 text-primary-200 text-xs font-black hover:bg-white/10 hover:text-primary-100 active:scale-[0.97] transition-all"
          >
            <Edit3 className="h-3.5 w-3.5 text-primary-500" />
            Edit Profile
          </Button>
          <Button
            onClick={() => onAddRelativeClick(member)}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-primary-500 text-primary-950 text-xs font-black shadow-lg shadow-primary-500/10 hover:bg-primary-600 active:scale-[0.97] transition-all"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Relative
          </Button>
          <Button
            variant="ghost"
            onClick={() => onDeleteClick(member.id)}
            className="h-10 px-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive active:scale-[0.97] transition-all"
            title="Delete member profile"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);

TreeSidebar.displayName = 'TreeSidebar';
