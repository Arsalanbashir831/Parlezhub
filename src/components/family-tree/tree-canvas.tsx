'use client';

import React from 'react';
import { GitCommit, ArrowDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamilyMember, FamilyTreeResponse } from '@/types/family-tree';
import { MemberCard } from './member-card';
import { cn } from '@/lib/utils';
import type { PanZoomState, CanvasEvents } from '@/hooks/use-pan-zoom';

// ---------------------------------------------------------------------------
// Exported type — used in family-tree-view.tsx to build connectorLines
// ---------------------------------------------------------------------------

export interface ConnectorLine {
  id: string;
  path: string;
  type: 'parent' | 'spouse';
  midX: number;
  midY: number;
  from_id: string;
  to_id: string;
  // Parent-line geometry
  parentX?: number;
  parentY?: number;
  childX?: number;
  childY?: number;
  // Spouse-line geometry
  spouse1X?: number;
  spouse1Y?: number;
  spouse2X?: number;
  spouse2Y?: number;
  birthYear?: string | null;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TreeCanvasProps {
  loading: boolean;
  treeData: FamilyTreeResponse;
  nodePositions: Record<string, { x: number; y: number }>;
  connectorLines: (ConnectorLine | null)[];
  /** Grouped pan + zoom state from usePanZoom(). */
  panZoom: PanZoomState;
  /** Native canvas event handlers from usePanZoom(). */
  canvasEvents: CanvasEvents;
  highlightedNodeId: string | null;
  linkingSource: FamilyMember | null;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  onCardClick: (member: FamilyMember) => void;
  onEditClick: (member: FamilyMember) => void;
  onLinkClick: (member: FamilyMember) => void;
  onDeleteClick: (member: FamilyMember) => void;
  onRemoveRelationship: (fromId: string, toId: string, type: 'parent' | 'spouse') => void;
  onAddFirstMember: () => void;
  onZoomReset: () => void;
  /** Optional relationType lets callers pre-select the relation in the dialog. */
  onAddRelativeClick: (member: FamilyMember, relationType?: 'spouse' | 'child' | 'parent') => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const TreeCanvas = React.memo(
  ({
    loading,
    treeData,
    nodePositions,
    connectorLines,
    panZoom,
    canvasEvents,
    highlightedNodeId,
    linkingSource,
    canvasContainerRef,
    onCardClick,
    onEditClick,
    onLinkClick,
    onDeleteClick,
    onRemoveRelationship,
    onAddFirstMember,
    onZoomReset,
    onAddRelativeClick,
  }: TreeCanvasProps) => {
    const { zoom, panX, panY, isPanning } = panZoom;

    return (
      <div
        ref={canvasContainerRef}
        className={cn(
          'flex-1 w-full relative overflow-hidden select-none',
          'bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]',
          'bg-[size:32px_32px]',
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        )}
        {...canvasEvents}
        onDoubleClick={onZoomReset}
      >
        {/* Loading state */}
        {loading && treeData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 z-10 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            <p className="text-sm font-semibold text-primary-400">Aligning family records...</p>
          </div>

        /* Empty state */
        ) : treeData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
            <div className="h-20 w-20 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-primary-500/5 animate-pulse">
              <GitCommit className="h-10 w-10 text-primary-500 rotate-45" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary-500 mb-2">Build Your Lineage</h3>
            <p className="text-sm text-primary-100/60 max-w-sm mb-6 leading-relaxed">
              Every legacy begins with a single node. Create your first family member profile to map
              out your generational tree.
            </p>
            <Button
              onClick={onAddFirstMember}
              className="flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-black text-primary-950 shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-transform active:scale-95 duration-200"
            >
              <GitCommit className="h-4 w-4" />
              Create First Member
            </Button>
          </div>

        /* Canvas with nodes */
        ) : (
          <div
            className="absolute origin-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              left: '50%',
              top: '30%',
            }}
          >
            {/* Ambient cosmic glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.03)_0%,rgba(99,102,241,0.02)_60%,transparent_100%)] blur-3xl pointer-events-none z-0" />

            {/* SVG connector lines */}
            <svg className="absolute overflow-visible pointer-events-none z-0" style={{ left: 0, top: 0 }}>
              {connectorLines.map((line) => {
                if (!line) return null;
                const isSpouse = line.type === 'spouse';

                return (
                  <g key={line.id} className="group/line pointer-events-auto">
                    {/* Wide transparent hit-area for easier hover */}
                    <path
                      d={line.path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      className="cursor-pointer"
                    />

                    {/* Visible connector */}
                    <path
                      d={line.path}
                      fill="none"
                      stroke={isSpouse ? '#f472b6' : '#d4af37'}
                      strokeWidth="2.5"
                      strokeDasharray={isSpouse ? '5,5' : '0'}
                      className="transition-colors duration-300 group-hover/line:stroke-primary-400 group-hover/line:stroke-[3.5px] drop-shadow-[0_0_4px_rgba(212,175,55,0.2)]"
                    />

                    {/* Endpoint circles */}
                    {isSpouse ? (
                      <>
                        {line.spouse1X !== undefined && line.spouse1Y !== undefined && (
                          <circle cx={line.spouse1X} cy={line.spouse1Y} r="4.5" fill="#0b001a" stroke="#f472b6" strokeWidth="2" className="pointer-events-none group-hover/line:scale-125 transition-transform duration-300" />
                        )}
                        {line.spouse2X !== undefined && line.spouse2Y !== undefined && (
                          <circle cx={line.spouse2X} cy={line.spouse2Y} r="4.5" fill="#0b001a" stroke="#f472b6" strokeWidth="2" className="pointer-events-none group-hover/line:scale-125 transition-transform duration-300" />
                        )}
                      </>
                    ) : (
                      <>
                        {line.parentX !== undefined && line.parentY !== undefined && (
                          <circle cx={line.parentX} cy={line.parentY} r="4.5" fill="#0b001a" stroke="#d4af37" strokeWidth="2" className="pointer-events-none group-hover/line:scale-125 transition-transform duration-300" />
                        )}
                        {line.childX !== undefined && line.childY !== undefined && (
                          <circle cx={line.childX} cy={line.childY} r="4.5" fill="#0b001a" stroke="#d4af37" strokeWidth="2" className="pointer-events-none group-hover/line:scale-125 transition-transform duration-300" />
                        )}
                      </>
                    )}

                    {/* Descent arrow (parent → child lines only) */}
                    {!isSpouse && (
                      <g style={{ transform: `translate(${line.midX}px, ${line.midY + 12}px) rotate(180deg)` }}>
                        <ArrowDown className="h-3.5 w-3.5 text-primary-500 -ml-[7px] -mt-[7px] group-hover/line:text-primary-400" />
                      </g>
                    )}

                    {/* Midpoint pill badge (fades out on hover to reveal unlink button) */}
                    <foreignObject
                      x={line.midX - 40}
                      y={line.midY - 8.5}
                      width="80"
                      height="17"
                      className="overflow-visible pointer-events-none transition-all duration-300 group-hover/line:opacity-0 group-hover/line:scale-75"
                    >
                      <div
                        className={cn(
                          'flex h-[17px] w-full items-center justify-center rounded-full border text-[7.5px] font-black uppercase tracking-widest backdrop-blur-md shadow-md shadow-black/10 select-none',
                          isSpouse
                            ? 'bg-pink-500/10 border-pink-500/30 text-pink-300'
                            : 'bg-primary-500/10 border-primary-500/30 text-primary-300'
                        )}
                      >
                        {isSpouse ? 'Partners' : line.birthYear ? `Born ${line.birthYear}` : 'Lineage'}
                      </div>
                    </foreignObject>

                    {/* Unlink button (appears on hover) */}
                    <foreignObject
                      x={line.midX - 10}
                      y={line.midY - 10}
                      width="20"
                      height="20"
                      className="overflow-visible opacity-0 group-hover/line:opacity-100 transition-all duration-300 scale-75 group-hover/line:scale-100"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onRemoveRelationship(line.from_id, line.to_id, line.type as 'parent' | 'spouse')
                        }
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white border border-background shadow-lg hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                        title="Disconnect relationship"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>

            {/* Member card nodes */}
            <div className="absolute overflow-visible z-10" style={{ left: 0, top: 0 }}>
              {treeData.nodes.map((member) => {
                const pos = nodePositions[member.id];
                if (!pos) return null;

                return (
                  <MemberCard
                    key={member.id}
                    member={member}
                    x={pos.x}
                    y={pos.y}
                    isTarget={highlightedNodeId === member.id}
                    isSource={linkingSource?.id === member.id}
                    isLinking={linkingSource !== null}
                    onCardClick={() => onCardClick(member)}
                    onEditClick={() => onEditClick(member)}
                    onLinkClick={() => onLinkClick(member)}
                    onDeleteClick={() => onDeleteClick(member)}
                    onAddRelativeClick={(relationType) => onAddRelativeClick(member, relationType)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

TreeCanvas.displayName = 'TreeCanvas';
