'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

// Services, Types & Helpers
import { familyTreeService } from '@/services/family-tree';
import { calculateNodePositions } from '@/lib/family-tree-layout';
import { FamilyMember, FamilyTreeResponse } from '@/types/family-tree';
import { CARD_DIMENSIONS } from '@/lib/family-tree-utils';
import { usePanZoom } from '@/hooks/use-pan-zoom';

// Modular UI components
import { MemberDialog } from './member-dialog';
import { LinkDialog } from './link-dialog';
import { TreeHeader } from './tree-header';
import { TreeToolbar } from './tree-toolbar';
import { LinkerBanner } from './linker-banner';
import { TreeCanvas } from './tree-canvas';
import type { ConnectorLine } from './tree-canvas';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { TreeSidebar } from './tree-sidebar';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FamilyTreeView() {
  // ── Core data ─────────────────────────────────────────────────────────────
  const [treeData, setTreeData] = useState<FamilyTreeResponse>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // ── Pan & Zoom (Issue #10 fix — extracted to usePanZoom hook) ─────────────
  const { panZoom, canvasEvents, zoom, setPanX, setPanY, handleZoomIn, handleZoomOut, handleZoomReset } =
    usePanZoom();

  // ── Modals ────────────────────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // ── Linking mode ──────────────────────────────────────────────────────────
  const [linkingSource, setLinkingSource] = useState<FamilyMember | null>(null);
  const [linkingTarget, setLinkingTarget] = useState<FamilyMember | null>(null);

  // ── Search highlight ──────────────────────────────────────────────────────
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // ── Detail sidebar ────────────────────────────────────────────────────────
  const [activeDetailMemberId, setActiveDetailMemberId] = useState<string | null>(null);
  const activeDetailMember = useMemo(
    () => treeData.nodes.find((n) => n.id === activeDetailMemberId) || null,
    [treeData.nodes, activeDetailMemberId]
  );

  // ── Canvas ref (shared between view and pan-to-member navigation) ─────────
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // ── Add-relative preselection ─────────────────────────────────────────────
  const [preselectedRelativeId, setPreselectedRelativeId] = useState<string | null>(null);
  const [preselectedRelationType, setPreselectedRelationType] = useState<
    'spouse' | 'child' | 'parent' | null
  >(null);

  // ── Delete confirmation ───────────────────────────────────────────────────
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false);

  const [relToDelete, setRelToDelete] = useState<{
    fromId: string;
    toId: string;
    type: 'parent' | 'spouse';
  } | null>(null);
  const [isDeleteRelDialogOpen, setIsDeleteRelDialogOpen] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────
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

  // ── Layout engine ─────────────────────────────────────────────────────────
  const nodePositions = useMemo(
    () => calculateNodePositions(treeData.nodes, treeData.edges, 400, 220),
    [treeData]
  );

  // ── Search & pan-to-member ────────────────────────────────────────────────
  const handleSearchSelect = useCallback(
    (member: FamilyMember) => {
      setHighlightedNodeId(member.id);
      const pos = nodePositions[member.id];
      if (pos && canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        setPanX(rect.width / 2 - pos.x * zoom - 110);
        setPanY(rect.height / 3 - pos.y * zoom - 48);
      }
      setTimeout(() => setHighlightedNodeId(null), 3000);
    },
    [nodePositions, zoom, setPanX, setPanY]
  );

  // ---------------------------------------------------------------------------
  // Shared relationship-builder (Issue #1 fix — eliminates duplicate logic)
  // ---------------------------------------------------------------------------
  const connectRelationshipForMember = useCallback(
    async (
      memberId: string,
      relationship: {
        relativeId: string;
        relationType: 'spouse' | 'child' | 'parent';
        otherParentId?: string;
      }
    ) => {
      let relationPayload;
      if (relationship.relationType === 'child') {
        relationPayload = {
          profile_id: memberId,           // child
          relative_id: relationship.relativeId, // parent
          relationship_type: 'parent' as const,
        };
      } else if (relationship.relationType === 'parent') {
        relationPayload = {
          profile_id: relationship.relativeId, // child
          relative_id: memberId,               // parent
          relationship_type: 'parent' as const,
        };
      } else {
        relationPayload = {
          profile_id: memberId,
          relative_id: relationship.relativeId,
          relationship_type: 'spouse' as const,
        };
      }
      await familyTreeService.connectRelationship(relationPayload);

      // Optional second-parent link (child-type relationships only)
      if (relationship.relationType === 'child' && relationship.otherParentId) {
        await familyTreeService.connectRelationship({
          profile_id: memberId,
          relative_id: relationship.otherParentId,
          relationship_type: 'parent' as const,
        });
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // CRUD operations
  // ---------------------------------------------------------------------------

  const handleCreateMember = useCallback(
    async (
      payload: {
        name?: string | null;
        gender?: 'male' | 'female' | 'other' | null;
        birth_date?: string | null;
        birth_time?: string | null;
        birth_place?: string | null;
        connected_user_id?: string | null;
        connected_user_email?: string | null;
      },
      relationship?: {
        relativeId: string;
        relationType: 'spouse' | 'child' | 'parent';
        otherParentId?: string;
      }
    ) => {
      try {
        const newMember = await familyTreeService.createMember(payload);
        if (relationship) {
          await connectRelationshipForMember(newMember.id, relationship);
        }
        toast.success('Family member added', { description: `"${newMember.name}" has been created.` });
        setIsCreateModalOpen(false);
        setPreselectedRelativeId(null);
        setPreselectedRelationType(null);
        fetchTreeData();
      } catch (err: unknown) {
        console.error('Failed to create family member:', err);
        const error = err as { response?: { data?: { non_field_errors?: string[] } } };
        const errMsg = error.response?.data?.non_field_errors?.[0] || 'Failed to create member';
        toast.error(errMsg);
        throw err;
      }
    },
    [fetchTreeData, connectRelationshipForMember]
  );

  const handleEditMember = useCallback(
    async (
      payload: {
        name?: string | null;
        gender?: 'male' | 'female' | 'other' | null;
        birth_date?: string | null;
        birth_time?: string | null;
        birth_place?: string | null;
        connected_user_id?: string | null;
        connected_user_email?: string | null;
      },
      relationship?: {
        relativeId: string;
        relationType: 'spouse' | 'child' | 'parent';
        otherParentId?: string;
      }
    ) => {
      if (!selectedMember) return;
      try {
        await familyTreeService.updateMember(selectedMember.id, payload);
        if (relationship) {
          await connectRelationshipForMember(selectedMember.id, relationship);
        }
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
    [selectedMember, fetchTreeData, connectRelationshipForMember]
  );

  // ── Add relative shortcut ─────────────────────────────────────────────────
  // Issue #17 fix: accepts an optional relationType so callers can pre-select
  // a relation type (e.g. "Add Spouse" button). Defaults to no pre-selection
  // when undefined, letting the dialog apply its own sensible default.
  const handleAddRelativeClick = useCallback(
    (member: FamilyMember, relationType?: 'spouse' | 'child' | 'parent') => {
      setPreselectedRelativeId(member.id);
      setPreselectedRelationType(relationType ?? null);
      setIsCreateModalOpen(true);
    },
    []
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteMemberClick = useCallback((uuid: string) => {
    setMemberToDelete(uuid);
    setIsDeleteMemberDialogOpen(true);
  }, []);

  const executeDeleteMember = useCallback(async () => {
    if (!memberToDelete) return;
    try {
      await familyTreeService.deleteMember(memberToDelete);
      toast.success('Member removed');
      setIsEditModalOpen(false);
      setIsDeleteMemberDialogOpen(false);
      if (activeDetailMemberId === memberToDelete) setActiveDetailMemberId(null);
      setMemberToDelete(null);
      fetchTreeData();
    } catch (err) {
      console.error('Failed to delete member:', err);
      toast.error('Failed to delete member');
    }
  }, [memberToDelete, activeDetailMemberId, fetchTreeData]);

  // ── Relationship management ────────────────────────────────────────────────
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
        toast.error('Self-Relation Blocked', { description: 'A member cannot relate to themselves.' });
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
        await familyTreeService.connectRelationship({
          profile_id: linkingSource.id,
          relative_id: linkingTarget.id,
          relationship_type: type,
        });
        toast.success('Relationship connected successfully');
        setIsLinkModalOpen(false);
        setLinkingSource(null);
        setLinkingTarget(null);
        fetchTreeData();
      } catch (err: unknown) {
        console.error('Failed to create relationship:', err);
        const error = err as { response?: { data?: { non_field_errors?: string[] } } };
        const errMsg = error.response?.data?.non_field_errors?.[0] || 'Failed to establish relationship';
        toast.error('Relationship Blocked', { description: errMsg });
        throw err;
      }
    },
    [linkingSource, linkingTarget, fetchTreeData]
  );

  const handleRemoveRelationshipClick = useCallback(
    (fromId: string, toId: string, type: 'parent' | 'spouse') => {
      setRelToDelete({ fromId, toId, type });
      setIsDeleteRelDialogOpen(true);
    },
    []
  );

  const executeRemoveRelationship = useCallback(async () => {
    if (!relToDelete) return;
    try {
      await familyTreeService.removeRelationship({
        profile_id: relToDelete.fromId,
        relative_id: relToDelete.toId,
        relationship_type: relToDelete.type,
      });
      toast.success('Relationship disconnected');
      setIsDeleteRelDialogOpen(false);
      setRelToDelete(null);
      fetchTreeData();
    } catch (err: unknown) {
      console.error('Failed to remove relationship:', err);
      toast.error('Failed to disconnect relationship');
    }
  }, [relToDelete, fetchTreeData]);

  // ── Connector lines (Issue #9 fix — uses CARD_DIMENSIONS constant) ─────────
  const connectorLines = useMemo((): (ConnectorLine | null)[] => {
    const { edges, nodes } = treeData;
    const { width: cardWidth, height: cardHeight } = CARD_DIMENSIONS;
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
        const midYHeight = parentY + (childY - parentY) / 2;
        const path = `M ${parentX} ${parentY} L ${parentX} ${midYHeight} L ${childX} ${midYHeight} L ${childX} ${childY}`;
        const midX = childX;
        const midY = childY - 22;
        const childMember = nodes.find((n) => n.id === e.from_id);
        const birthYear = childMember?.birth_date ? childMember.birth_date.split('-')[0] : null;

        return {
          id: e.id || `edge-${idx}`,
          path,
          type: 'parent' as const,
          midX,
          midY,
          from_id: e.from_id,
          to_id: e.to_id,
          parentX,
          parentY,
          childX,
          childY,
          birthYear,
        };
      }

      // Spouse edges — deduplicate symmetric pairs
      const pairKey = [e.from_id, e.to_id].sort().join('::');
      if (seenSpousePairs.has(pairKey)) return null;
      seenSpousePairs.add(pairKey);

      // Only draw between horizontally adjacent nodes
      const dx = Math.abs(p1.x - p2.x);
      const dy = Math.abs(p1.y - p2.y);
      if (dy > 10 || dx > 600) return null;

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
        spouse1X,
        spouse1Y,
        spouse2X,
        spouse2Y,
      };
    });
  }, [treeData, nodePositions]);

  // ── Card interaction ──────────────────────────────────────────────────────
  const handleCardClick = useCallback(
    (member: FamilyMember) => {
      if (linkingSource) {
        selectLinkingTarget(member);
      } else {
        setActiveDetailMemberId(member.id);
      }
    },
    [linkingSource, selectLinkingTarget]
  );

  const handleEditClick = useCallback((member: FamilyMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  }, []);

  const handleCancelLinking = useCallback(() => setLinkingSource(null), []);
  const handleAddFirstMember = useCallback(() => setIsCreateModalOpen(true), []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background relative">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* 1. Header */}
      <TreeHeader />

      {/* 2. Secondary toolbar */}
      <TreeToolbar
        nodes={treeData.nodes}
        onSearchSelect={handleSearchSelect}
        onAddMemberClick={handleAddFirstMember}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      {/* 3. Linking mode alert banner */}
      <LinkerBanner linkingSource={linkingSource} onCancel={handleCancelLinking} />

      {/* 4. Pannable / zoomable canvas */}
      <TreeCanvas
        loading={loading}
        treeData={treeData}
        nodePositions={nodePositions}
        connectorLines={connectorLines}
        panZoom={panZoom}
        canvasEvents={canvasEvents}
        highlightedNodeId={highlightedNodeId}
        linkingSource={linkingSource}
        canvasContainerRef={canvasContainerRef}
        onCardClick={handleCardClick}
        onEditClick={handleEditClick}
        onLinkClick={startLinking}
        onDeleteClick={(member) => handleDeleteMemberClick(member.id)}
        onRemoveRelationship={handleRemoveRelationshipClick}
        onAddFirstMember={handleAddFirstMember}
        onZoomReset={handleZoomReset}
        onAddRelativeClick={handleAddRelativeClick}
      />

      {/* 5. Member details sidebar */}
      <TreeSidebar
        member={activeDetailMember}
        onClose={() => setActiveDetailMemberId(null)}
        nodes={treeData.nodes}
        edges={treeData.edges}
        onNavigateToMember={handleSearchSelect}
        onEditClick={handleEditClick}
        onAddRelativeClick={handleAddRelativeClick}
        onDeleteClick={handleDeleteMemberClick}
      />

      {/* A. Create member dialog */}
      <MemberDialog
        isOpen={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            setPreselectedRelativeId(null);
            setPreselectedRelationType(null);
          }
        }}
        mode="create"
        existingMembers={treeData.nodes}
        existingRelationships={treeData.edges}
        defaultRelativeId={preselectedRelativeId}
        defaultRelationType={preselectedRelationType}
        onSubmit={handleCreateMember}
      />

      {/* B. Edit member dialog */}
      <MemberDialog
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        member={selectedMember}
        existingMembers={treeData.nodes}
        existingRelationships={treeData.edges}
        onSubmit={handleEditMember}
        onDelete={handleDeleteMemberClick}
        onRefresh={fetchTreeData}
      />

      {/* C. Create relationship (link-mode) dialog */}
      <LinkDialog
        isOpen={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
        source={linkingSource}
        target={linkingTarget}
        onSubmit={handleCreateRelationship}
      />

      {/* D. Delete member confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteMemberDialogOpen}
        onClose={() => { setIsDeleteMemberDialogOpen(false); setMemberToDelete(null); }}
        onConfirm={executeDeleteMember}
        title="Delete Family Member"
        description="Are you sure you want to delete this family member? All their relationships will be removed automatically."
        confirmText="Delete"
      />

      {/* E. Remove relationship confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteRelDialogOpen}
        onClose={() => { setIsDeleteRelDialogOpen(false); setRelToDelete(null); }}
        onConfirm={executeRemoveRelationship}
        title="Remove Relationship"
        description="Are you sure you want to remove this relationship connection?"
        confirmText="Remove"
      />
    </div>
  );
}
