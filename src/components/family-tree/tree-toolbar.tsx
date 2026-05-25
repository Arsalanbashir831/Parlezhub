'use client';

import React, { useState, useMemo } from 'react';
import { Search, UserPlus, ZoomIn, ZoomOut, Maximize2, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FamilyMember } from '@/types/family-tree';

interface TreeToolbarProps {
  nodes: FamilyMember[];
  onSearchSelect: (member: FamilyMember) => void;
  onAddMemberClick: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export const TreeToolbar = React.memo(
  ({
    nodes,
    onSearchSelect,
    onAddMemberClick,
    onZoomIn,
    onZoomOut,
    onZoomReset,
  }: TreeToolbarProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSelect = (member: FamilyMember) => {
      setSearchQuery(member.name);
      onSearchSelect(member);
    };

    const filteredMembers = useMemo(() => {
      if (!searchQuery.trim()) return [];
      return nodes.filter((n) =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [nodes, searchQuery]);

    return (
      <div className="relative z-20 flex flex-wrap gap-4 items-center justify-between border-b border-primary-500/10 bg-background/50 p-4 backdrop-blur-xl shrink-0 select-none">
        <div className="hidden md:flex items-center gap-2.5">
          <Network className="h-5 w-5 text-primary-500 drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
          <h1 className="font-serif text-lg font-bold text-primary-500">Family Tree</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-primary-100/30" />
            <Input
              type="text"
              placeholder="Search family members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-primary-500/20 bg-white/[0.03] text-primary-100 placeholder:text-primary-100/30 focus-visible:ring-primary-500/35"
            />
            {filteredMembers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-primary-500/20 bg-background/95 backdrop-blur-xl shadow-2xl z-50 p-1.5 space-y-1">
                {filteredMembers.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleSearchSelect(n)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-primary-100 hover:bg-primary-500 hover:text-primary-950 transition-colors"
                  >
                    {n.name}{' '}
                    <span className="text-[10px] text-primary-100/40 ml-1.5">
                      ({n.gender})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add member button */}
          <Button
            onClick={onAddMemberClick}
            className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-extrabold text-primary-950 shadow-lg shadow-primary-500/10 hover:bg-primary-600 transition-transform active:scale-95 duration-200"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>

          {/* View control HUD */}
          <div className="flex rounded-xl border border-primary-500/20 bg-white/[0.03] p-1 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomIn}
              title="Zoom In"
              className="h-8 w-8 text-primary-300 hover:bg-white/5 active:scale-90 transition-transform"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomOut}
              title="Zoom Out"
              className="h-8 w-8 text-primary-300 hover:bg-white/5 active:scale-90 transition-transform"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomReset}
              title="Reset View"
              className="h-8 w-8 text-primary-300 hover:bg-white/5 active:scale-90 transition-transform"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

TreeToolbar.displayName = 'TreeToolbar';
