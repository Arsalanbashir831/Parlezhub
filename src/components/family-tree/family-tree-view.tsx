'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

// Import Services, Types & Helpers
import { familyTreeService } from '@/services/family-tree';
import { calculateNodePositions } from '@/lib/family-tree-layout';
import { FamilyMember, FamilyTreeResponse } from '@/types/family-tree';

// Import Shared Modular Components
import { MemberDialog } from './member-dialog';
import { LinkDialog } from './link-dialog';
import { TreeHeader } from './tree-header';
import { TreeToolbar } from './tree-toolbar';
import { LinkerBanner } from './linker-banner';
import { TreeCanvas } from './tree-canvas';

export default function FamilyTreeView() {
  // --- States ---
  const [treeData, setTreeData] = useState<FamilyTreeResponse>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Zoom & Pan
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Linking Mode
  const [linkingSource, setLinkingSource] = useState<FamilyMember | null>(null);
  const [linkingTarget, setLinkingTarget] = useState<FamilyMember | null>(null);

  // Search highlighting
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Canvas ref
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // --- Fetch Data ---
  const fetchTreeData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await familyTreeService.getFamilyTree();
      setTreeData(data);
    } catch (err) {
      console.error('Failed to fetch family tree data:', err);
      toast.error('Failed to load family tree');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTreeData();
  }, [fetchTreeData]);

  // --- Layout Engine Algorithm ---
  const nodePositions = useMemo(() => {
    return calculateNodePositions(treeData.nodes, treeData.edges);
  }, [treeData]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.1, 2.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.1, 0.3));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
  }, []);

  // --- Search & Locating ---
  const handleSearchSelect = useCallback(
    (member: FamilyMember) => {
      setHighlightedNodeId(member.id);

      const pos = nodePositions[member.id];
      if (pos) {
        if (canvasContainerRef.current) {
          const rect = canvasContainerRef.current.getBoundingClientRect();
          setPanX(rect.width / 2 - pos.x * zoom - 110);
          setPanY(rect.height / 3 - pos.y * zoom - 48);
        }
      }

      setTimeout(() => {
        setHighlightedNodeId(null);
      }, 3000);
    },
    [nodePositions, zoom]
  );

  // --- CRUD Operations ---
  const handleCreateMember = useCallback(
    async (payload: {
      name: string;
      gender: 'male' | 'female' | 'other' | null;
      birth_date: string | null;
      birth_time: string | null;
      birth_place: string | null;
    }) => {
      try {
        const newMember = await familyTreeService.createMember(payload);
        toast.success('Family member added', { description: `"${newMember.name}" has been created.` });
        setIsCreateModalOpen(false);
        fetchTreeData();
      } catch (err: unknown) {
        console.error('Failed to create family member:', err);
        const error = err as { response?: { data?: { non_field_errors?: string[] } } };
        const errMsg = error.response?.data?.non_field_errors?.[0] || 'Failed to create member';
        toast.error(errMsg);
        throw err;
      }
    },
    [fetchTreeData]
  );

  const handleEditMember = useCallback(
    async (payload: {
      name: string;
      gender: 'male' | 'female' | 'other' | null;
      birth_date: string | null;
      birth_time: string | null;
      birth_place: string | null;
    }) => {
      if (!selectedMember) return;
      try {
        await familyTreeService.updateMember(selectedMember.id, payload);
        toast.success('Family member updated');
        setIsEditModalOpen(false);
        fetchTreeData();
      } catch (err: unknown) {
        console.error('Failed to update member:', err);
        const error = err as { response?: { data?: { non_field_errors?: string[] } } };
        const errMsg = error.response?.data?.non_field_errors?.[0] || 'Failed to update member';
        toast.error(errMsg);
        throw err;
      }
    },
    [selectedMember, fetchTreeData]
  );

  const handleDeleteMember = useCallback(
    async (uuid: string) => {
      if (
        !confirm(
          'Are you sure you want to delete this family member? All their relationships will be removed automatically.'
        )
      )
        return;
      try {
        await familyTreeService.deleteMember(uuid);
        toast.success('Member removed');
        setIsEditModalOpen(false);
        fetchTreeData();
      } catch (err) {
        console.error('Failed to delete member:', err);
        toast.error('Failed to delete member');
      }
    },
    [fetchTreeData]
  );

  // --- Relationship Handling ---
  const startLinking = useCallback((member: FamilyMember) => {
    setLinkingSource(member);
    setLinkingTarget(null);
    toast.info('Linking Mode Active', {
      description: `Click another member to connect with ${member.name}.`,
    });
  }, []);

  const selectLinkingTarget = useCallback(
    (member: FamilyMember) => {
      if (!linkingSource) return;
      if (linkingSource.id === member.id) {
        toast.error('Self-Relation Blocked', {
          description: 'A member cannot relate to themselves.',
        });
        return;
      }
      setLinkingTarget(member);
      setIsLinkModalOpen(true);
    },
    [linkingSource]
  );

  const handleCreateRelationship = useCallback(
    async (type: 'parent' | 'spouse') => {
      if (!linkingSource || !linkingTarget) return;
      try {
        const payload = {
          profile_id: linkingSource.id,
          relative_id: linkingTarget.id,
          relationship_type: type,
        };

        await familyTreeService.connectRelationship(payload);
        toast.success('Relationship connected successfully');
        setIsLinkModalOpen(false);
        setLinkingSource(null);
        setLinkingTarget(null);
        fetchTreeData();
      } catch (err: unknown) {
        console.error('Failed to create relationship:', err);
        const error = err as { response?: { data?: { non_field_errors?: string[] } } };
        const errMsg =
          error.response?.data?.non_field_errors?.[0] || 'Failed to establish relationship';
        toast.error('Relationship Blocked', { description: errMsg });
        throw err;
      }
    },
    [linkingSource, linkingTarget, fetchTreeData]
  );

  const handleRemoveRelationship = useCallback(
    async (fromId: string, toId: string, type: 'parent' | 'spouse') => {
      if (!confirm('Remove this relationship connection?')) return;
      try {
        const payload = {
          profile_id: fromId,
          relative_id: toId,
          relationship_type: type,
        };
        await familyTreeService.removeRelationship(payload);
        toast.success('Relationship disconnected');
        fetchTreeData();
      } catch (err: unknown) {
        console.error('Failed to remove relationship:', err);
        toast.error('Failed to disconnect relationship');
      }
    },
    [fetchTreeData]
  );

  // --- Connector lines calculations ---
  const connectorLines = useMemo(() => {
    const { edges } = treeData;
    const cardWidth = 220;
    const cardHeight = 96;

    // Deduplicate symmetric spouse edges: only keep one direction per pair
    const seenSpousePairs = new Set<string>();

    return edges.map((e, idx) => {
      const p1 = nodePositions[e.from_id];
      const p2 = nodePositions[e.to_id];
      if (!p1 || !p2) return null;

      if (e.type === 'parent') {
        const parentX = p2.x + cardWidth / 2;
        const parentY = p2.y + cardHeight;
        const childX = p1.x + cardWidth / 2;
        const childY = p1.y;

        const path = `M ${parentX} ${parentY} C ${parentX} ${parentY + 30}, ${childX} ${childY - 30}, ${childX} ${childY}`;
        const midX = (parentX + childX) / 2;
        const midY = (parentY + childY) / 2;

        return {
          id: e.id || `edge-${idx}`,
          path,
          type: 'parent' as const,
          midX,
          midY,
          from_id: e.from_id,
          to_id: e.to_id,
        };
      }

      // --- Spouse line ---

      // 1. Deduplicate: skip if we already drew the reverse edge
      const pairKey = [e.from_id, e.to_id].sort().join('::');
      if (seenSpousePairs.has(pairKey)) return null;
      seenSpousePairs.add(pairKey);

      // 2. Only draw between ADJACENT nodes (same Y, gap ≤ 1.5× horizontalSpacing)
      //    Non-adjacent spouse lines (e.g. wife3 → hub with wife1 in between) would
      //    cross through other cards and make the tree unreadable.
      const dx = Math.abs(p1.x - p2.x);
      const dy = Math.abs(p1.y - p2.y);
      const adjacentThreshold = 420; // 1.5 × default 280 spacing
      if (dy > 10 || dx > adjacentThreshold) return null;

      const isLeft = p1.x < p2.x;
      const spouse1X = isLeft ? p1.x + cardWidth : p1.x;
      const spouse1Y = p1.y + cardHeight / 2;
      const spouse2X = isLeft ? p2.x : p2.x + cardWidth;
      const spouse2Y = p2.y + cardHeight / 2;

      const path = `M ${spouse1X} ${spouse1Y} L ${spouse2X} ${spouse2Y}`;
      const midX = (spouse1X + spouse2X) / 2;
      const midY = (spouse1Y + spouse2Y) / 2;

      return {
        id: e.id || `edge-${idx}`,
        path,
        type: 'spouse' as const,
        midX,
        midY,
        from_id: e.from_id,
        to_id: e.to_id,
      };
    });
  }, [treeData, nodePositions]);

  const handleCardClick = useCallback(
    (member: FamilyMember) => {
      if (linkingSource) {
        selectLinkingTarget(member);
      }
    },
    [linkingSource, selectLinkingTarget]
  );

  const handleEditClick = useCallback((member: FamilyMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  }, []);

  const handleCancelLinking = useCallback(() => {
    setLinkingSource(null);
  }, []);

  const handleAddFirstMember = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background relative">
      {/* space grid backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* 1. Header (Logo, title info, MiniCard & Logout) */}
      <TreeHeader />

      {/* 2. Secondary Toolbar Controls */}
      <TreeToolbar
        nodes={treeData.nodes}
        onSearchSelect={handleSearchSelect}
        onAddMemberClick={handleAddFirstMember}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      {/* 3. Linker banner alert banner */}
      <LinkerBanner
        linkingSource={linkingSource}
        onCancel={handleCancelLinking}
      />

      {/* 4. Draggable zoom/pan Canvas */}
      <TreeCanvas
        loading={loading}
        treeData={treeData}
        nodePositions={nodePositions}
        connectorLines={connectorLines}
        zoom={zoom}
        setZoom={setZoom}
        panX={panX}
        setPanX={setPanX}
        panY={panY}
        setPanY={setPanY}
        isPanning={isPanning}
        setIsPanning={setIsPanning}
        panStart={panStart}
        highlightedNodeId={highlightedNodeId}
        linkingSource={linkingSource}
        canvasContainerRef={canvasContainerRef}
        onCardClick={handleCardClick}
        onEditClick={handleEditClick}
        onLinkClick={startLinking}
        onDeleteClick={(member) => handleDeleteMember(member.id)}
        onRemoveRelationship={handleRemoveRelationship}
        onAddFirstMember={handleAddFirstMember}
        onZoomReset={handleZoomReset}
      />

      {/* A. Create Member Dialog */}
      <MemberDialog
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        onSubmit={handleCreateMember}
      />

      {/* B. Edit Member Dialog */}
      <MemberDialog
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        member={selectedMember}
        onSubmit={handleEditMember}
        onDelete={handleDeleteMember}
      />

      {/* C. Create Relationship Dialog */}
      <LinkDialog
        isOpen={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
        source={linkingSource}
        target={linkingTarget}
        onSubmit={handleCreateRelationship}
      />
    </div>
  );
}
