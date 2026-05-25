'use client';

import React from 'react';
import { GitCommit, ArrowDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamilyMember, FamilyTreeResponse } from '@/types/family-tree';
import { MemberCard } from './member-card';

interface ConnectorLine {
  id: string;
  path: string;
  type: 'parent' | 'spouse';
  midX: number;
  midY: number;
  from_id: string;
  to_id: string;
}

interface TreeCanvasProps {
  loading: boolean;
  treeData: FamilyTreeResponse;
  nodePositions: Record<string, { x: number; y: number }>;
  connectorLines: (ConnectorLine | null)[];
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  panX: number;
  setPanX: React.Dispatch<React.SetStateAction<number>>;
  panY: number;
  setPanY: React.Dispatch<React.SetStateAction<number>>;
  isPanning: boolean;
  setIsPanning: (panning: boolean) => void;
  panStart: React.MutableRefObject<{ x: number; y: number }>;
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
}

export const TreeCanvas = React.memo(
  ({
    loading,
    treeData,
    nodePositions,
    connectorLines,
    zoom,
    setZoom,
    panX,
    setPanX,
    panY,
    setPanY,
    isPanning,
    setIsPanning,
    panStart,
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
  }: TreeCanvasProps) => {
    // --- Pan & Zoom Events ---
    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) return;
      const isBg = (e.target as HTMLElement).closest('.node-card') === null;
      if (!isBg) return;

      setIsPanning(true);
      panStart.current = { x: e.clientX - panX, y: e.clientY - panY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isPanning) return;
      setPanX(e.clientX - panStart.current.x);
      setPanY(e.clientY - panStart.current.y);
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
      const zoomFactor = 0.08;
      const nextZoom =
        e.deltaY < 0 ? Math.min(zoom + zoomFactor, 2.0) : Math.max(zoom - zoomFactor, 0.3);
      setZoom(nextZoom);
    };

    return (
      <div
        ref={canvasContainerRef}
        className="flex-1 w-full relative overflow-hidden bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={onZoomReset}
      >
        {loading && treeData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 z-10 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            <p className="text-sm font-semibold text-primary-400">Aligning family records...</p>
          </div>
        ) : treeData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
            <div className="h-20 w-20 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-primary-500/5 animate-pulse">
              <GitCommit className="h-10 w-10 text-primary-500 rotate-45" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary-500 mb-2">Build Your Lineage</h3>
            <p className="text-sm text-primary-100/60 max-w-sm mb-6 leading-relaxed">
              Every legacy begins with a single node. Create your first family member profile to map out your generational tree.
            </p>
            <Button
              onClick={onAddFirstMember}
              className="flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-black text-primary-950 shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-transform active:scale-95 duration-200"
            >
              <GitCommit className="h-4.5 w-4.5" />
              Create First Member
            </Button>
          </div>
        ) : (
          /* Draggable Zoomable Wrapper */
          <div
            className="absolute origin-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              left: '50%',
              top: '30%',
            }}
          >
            {/* SVG Relationship Connector Lines Layer */}
            <svg className="absolute overflow-visible pointer-events-none z-0" style={{ left: 0, top: 0 }}>
              {connectorLines.map((line) => {
                if (!line) return null;
                const isSpouse = line.type === 'spouse';

                return (
                  <g key={line.id} className="group/line pointer-events-auto">
                    {/* Hover shadow buffer line */}
                    <path
                      d={line.path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      className="cursor-pointer"
                    />
                    {/* Visible line */}
                    <path
                      d={line.path}
                      fill="none"
                      stroke={isSpouse ? '#f472b6' : '#d4af37'}
                      strokeWidth="2.5"
                      strokeDasharray={isSpouse ? '5,5' : '0'}
                      className="transition-colors duration-300 group-hover/line:stroke-primary-400 group-hover/line:stroke-[3.5px] drop-shadow-[0_0_4px_rgba(212,175,55,0.2)]"
                    />

                    {/* Arrow marker for Parent to Child descending line */}
                    {!isSpouse && (
                      <g style={{ transform: `translate(${line.midX}px, ${line.midY}px) rotate(180deg)` }}>
                        <ArrowDown className="h-4 w-4 text-primary-500 -ml-2 -mt-2 group-hover/line:text-primary-400" />
                      </g>
                    )}

                    {/* Unlink center cross action */}
                    <foreignObject
                      x={line.midX - 10}
                      y={line.midY - 10}
                      width="20"
                      height="20"
                      className="overflow-visible opacity-0 group-hover/line:opacity-100 transition-opacity duration-300"
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

            {/* Member Cards Layer */}
            <div className="absolute overflow-visible z-10" style={{ left: 0, top: 0 }}>
              {treeData.nodes.map((member) => {
                const pos = nodePositions[member.id];
                if (!pos) return null;

                const isTarget = highlightedNodeId === member.id;
                const isSource = linkingSource?.id === member.id;
                const isLinking = linkingSource !== null;

                return (
                  <MemberCard
                    key={member.id}
                    member={member}
                    x={pos.x}
                    y={pos.y}
                    isTarget={isTarget}
                    isSource={isSource}
                    isLinking={isLinking}
                    onCardClick={() => onCardClick(member)}
                    onEditClick={() => onEditClick(member)}
                    onLinkClick={() => onLinkClick(member)}
                    onDeleteClick={() => onDeleteClick(member)}
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
