'use client';

import React, { useState, useEffect, useRef, useTransition, useMemo, useCallback } from 'react';
import {
  UserPlus, Edit3, Trash2, User, Calendar, MapPin, Clock,
  Users, Heart, Sparkles, Link2, CheckCircle2,
} from 'lucide-react';
import { FamilyMember, FamilyRelationship, FamilyTreeUser } from '@/types/family-tree';
import { familyTreeService } from '@/services/family-tree';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RelationType = 'spouse' | 'child' | 'parent';
type Gender = 'male' | 'female' | 'other';

interface MemberPayload {
  name?: string | null;
  gender?: Gender | null;
  birth_date?: string | null;
  birth_time?: string | null;
  birth_place?: string | null;
  connected_user_id?: string | null;
  connected_user_email?: string | null;
}

interface RelationshipSpec {
  relativeId: string;
  relationType: RelationType;
  otherParentId?: string;
}

interface MemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  member?: FamilyMember | null;
  existingMembers?: FamilyMember[];
  existingRelationships?: FamilyRelationship[];
  defaultRelativeId?: string | null;
  defaultRelationType?: RelationType | null;
  onSubmit: (payload: MemberPayload, relationship?: RelationshipSpec) => Promise<void>;
  /** Synchronous trigger — opens the delete confirmation dialog upstream. */
  onDelete?: (uuid: string) => void;
  onRefresh?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MemberDialog({
  isOpen,
  onOpenChange,
  mode,
  member,
  existingMembers = [],
  existingRelationships = [],
  defaultRelativeId,
  defaultRelationType,
  onSubmit,
  onDelete,
  onRefresh,
}: MemberDialogProps) {
  // ── Form fields ──────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>('male');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [isPending, startTransition] = useTransition();

  // ── Linked user search ───────────────────────────────────────────────────
  const [isLinkedUserMode, setIsLinkedUserMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FamilyTreeUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [connectedUserId, setConnectedUserId] = useState<string | null>(null);
  const [connectedUserEmail, setConnectedUserEmail] = useState<string | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<{ name: string; email: string } | null>(null);

  // ── Relationship fields ──────────────────────────────────────────────────
  const [connectToRelative, setConnectToRelative] = useState(true);
  const [relativeId, setRelativeId] = useState('');
  const [relationType, setRelationType] = useState<RelationType>('child');
  const [connectToSpouseParent, setConnectToSpouseParent] = useState(true);
  const [selectedOtherParentId, setSelectedOtherParentId] = useState('');

  // ── Per-row relationship disconnect state ────────────────────────────────
  const [disconnectingRelId, setDisconnectingRelId] = useState<string | null>(null);

  // ── Stable ref for selectable members (avoids stale closure in effects) ──
  const latestSelectableMembersRef = useRef(existingMembers);

  // Members excluding the one being edited
  const selectableMembers = useMemo(
    () => existingMembers.filter((m) => !member || m.id !== member.id),
    [existingMembers, member]
  );
  // Keep ref in sync on every render (no effect needed)
  latestSelectableMembersRef.current = selectableMembers;

  // ── Spouses of the selected relative (memoized — fixes Issues #3 & #4) ──
  const spouses = useMemo(() => {
    if (!relativeId) return [];
    const spouseEdges = existingRelationships.filter(
      (r) => r.type === 'spouse' && (r.from_id === relativeId || r.to_id === relativeId)
    );
    const spouseIds = spouseEdges.map((r) =>
      r.from_id === relativeId ? r.to_id : r.from_id
    );
    return existingMembers.filter((m) => spouseIds.includes(m.id));
  }, [relativeId, existingRelationships, existingMembers]);

  const singleSpouse = spouses.length === 1 ? spouses[0] : null;

  // ── Current connections for Edit-mode list ───────────────────────────────
  const currentConnections = useMemo(() => {
    if (mode !== 'edit' || !member) return [];
    return existingRelationships
      .filter((r) => r.from_id === member.id || r.to_id === member.id)
      .map((r) => {
        const isFrom = r.from_id === member.id;
        const relId = isFrom ? r.to_id : r.from_id;
        const relative = existingMembers.find((m) => m.id === relId);
        const displayType: RelationType =
          r.type === 'parent' ? (isFrom ? 'parent' : 'child') : r.type;
        return {
          relationshipId: r.id,
          relativeName: relative?.name || 'Unnamed',
          type: displayType,
          edge: r,
        };
      });
  }, [mode, member, existingRelationships, existingMembers]);

  // ── Effect 1: sync form from member prop (edit mode only) ────────────────
  //    No `selectableMembers` in deps — uses the ref to avoid unintended resets
  //    on every tree refresh (#5 fix).
  useEffect(() => {
    if (mode !== 'edit' || !member) return;
    setName(member.name || '');
    setGender(member.gender);
    setBirthDate(member.birth_date || '');
    setBirthTime(member.birth_time ? member.birth_time.slice(0, 5) : '');
    setBirthPlace(member.birth_place || '');
    setConnectToRelative(false);
    const members = latestSelectableMembersRef.current;
    if (members.length > 0) setRelativeId(members[0].id);
    setRelationType('child');
    if (member.is_connected && member.connected_user_details) {
      setConnectedUserId(member.connected_user_details.id);
      setConnectedUserEmail(member.connected_user_details.email);
      setSelectedUserDetails({
        name:
          `${member.connected_user_details.first_name || ''} ${member.connected_user_details.last_name || ''}`.trim() ||
          member.connected_user_details.email,
        email: member.connected_user_details.email,
      });
    } else {
      setConnectedUserId(null);
      setConnectedUserEmail(null);
      setSelectedUserDetails(null);
    }
  }, [mode, member]); // intentionally excludes selectableMembers

  // ── Effect 2: reset form when create dialog opens ────────────────────────
  useEffect(() => {
    if (mode !== 'create' || !isOpen) return;
    setName('');
    setGender('male');
    setBirthDate('');
    setBirthTime('');
    setBirthPlace('');
    setConnectedUserId(null);
    setConnectedUserEmail(null);
    setSelectedUserDetails(null);
    setIsLinkedUserMode(false);
    setSearchQuery('');
    setSearchResults([]);
    const members = latestSelectableMembersRef.current;
    const hasMembers = members.length > 0;
    setConnectToRelative(!!defaultRelativeId || hasMembers);
    setRelativeId(defaultRelativeId || (hasMembers ? members[0].id : ''));
    setRelationType(defaultRelationType || 'child');
  }, [mode, isOpen, defaultRelativeId, defaultRelationType]); // intentionally excludes selectableMembers

  // ── Effect 3: reset spouse-parent state when spouses change ─────────────
  //    spouses is now a memoized value — no eslint-disable needed (#4 fix).
  useEffect(() => {
    setConnectToSpouseParent(true);
    setSelectedOtherParentId(spouses.length > 1 ? spouses[0].id : '');
  }, [spouses]);

  // ── Debounced user search ────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await familyTreeService.searchUsers(searchQuery);
        setSearchResults(users);
      } catch (err) {
        console.error('Failed to search users:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectUser = (user: FamilyTreeUser) => {
    setConnectedUserId(user.id);
    setConnectedUserEmail(user.email);
    setSelectedUserDetails({ name: user.name, email: user.email });
    setSearchQuery('');
    setSearchResults([]);
    setIsLinkedUserMode(false);
    if (!name.trim()) setName(user.name);
  };

  const handleUnlinkUser = () => {
    setConnectedUserId(null);
    setConnectedUserEmail(null);
    setSelectedUserDetails(null);
  };

  /**
   * Extracted disconnect handler — fixes Issue #2 (async onClick anti-pattern).
   * Has its own loading state per row to prevent double-clicks / race conditions.
   */
  const handleDisconnectRelationship = useCallback(
    async (edge: FamilyRelationship) => {
      setDisconnectingRelId(edge.id);
      try {
        await familyTreeService.removeRelationship({
          profile_id: edge.from_id,
          relative_id: edge.to_id,
          relationship_type: edge.type,
        });
        toast.success('Relationship disconnected');
        onRefresh?.();
      } catch (err) {
        console.error('Failed to disconnect relationship:', err);
        toast.error('Failed to disconnect relationship');
      } finally {
        setDisconnectingRelId(null);
      }
    },
    [onRefresh]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !connectedUserId) {
      toast.error('Full Name is required when no app user is linked');
      return;
    }

    startTransition(async () => {
      try {
        const payload: MemberPayload = {
          name: name.trim() || null,
          gender,
          birth_date: birthDate || null,
          birth_time: birthTime ? `${birthTime}:00` : null,
          birth_place: birthPlace || null,
          connected_user_id: connectedUserId,
          connected_user_email: connectedUserEmail,
        };

        let otherParentId: string | undefined;
        if (relationType === 'child') {
          if (spouses.length === 1 && connectToSpouseParent && singleSpouse) {
            otherParentId = singleSpouse.id;
          } else if (spouses.length > 1 && selectedOtherParentId && selectedOtherParentId !== 'none') {
            otherParentId = selectedOtherParentId;
          }
        }

        // Relationship creation is now allowed in BOTH create and edit modes (#11 fix)
        const relationship: RelationshipSpec | undefined =
          connectToRelative && relativeId
            ? { relativeId, relationType, otherParentId }
            : undefined;

        await onSubmit(payload, relationship);
      } catch (err: unknown) {
        console.error('Failed to submit member details:', err);
      }
    });
  };

  /**
   * Normalised to synchronous void — onDelete merely opens the confirmation
   * dialog upstream; the actual deletion happens there (#12 fix).
   */
  const handleDelete = () => {
    if (!onDelete || !member) return;
    onDelete(member.id);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-primary-500/15 bg-background/95 backdrop-blur-2xl text-primary-100 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-serif text-xl font-bold text-primary-500 flex items-center gap-2 drop-shadow-[0_0_6px_rgba(212,175,55,0.2)]">
            {mode === 'create' ? <UserPlus className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
            {mode === 'create' ? 'Add Family Member' : 'Edit Family Member'}
          </DialogTitle>
          <DialogDescription className="text-primary-100/40 text-[11px] font-medium uppercase tracking-wide">
            {mode === 'create'
              ? 'Add a new member profile to your celestial tree.'
              : 'Modify member information or disconnect user profiles.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-3">
          {/* ── Linked account section ── */}
          <div className="space-y-2 border-b border-primary-500/5 pb-4">
            {selectedUserDetails ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-primary-500/15 bg-primary-500/5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-primary-500" /> Linked Platform Account
                  </span>
                  <span className="text-sm font-extrabold text-primary-100 mt-1 truncate">{selectedUserDetails.name}</span>
                  <span className="text-[11px] font-medium text-primary-100/50 truncate">{selectedUserDetails.email}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUnlinkUser}
                  className="text-[10px] font-black uppercase tracking-wider text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0 transition-colors ml-2"
                >
                  Disconnect
                </Button>
              </div>
            ) : !isLinkedUserMode ? (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLinkedUserMode(true)}
                  className="text-[10px] font-black uppercase tracking-wider border-primary-500/15 bg-white/[0.01] text-primary-300 hover:bg-primary-500/10 hover:text-primary-400 flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all active:scale-[0.97]"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Link Registered Account
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5 p-4 rounded-xl border border-primary-500/10 bg-white/[0.005] animate-in fade-in slide-in-from-top-1 duration-200 relative">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-primary-400 flex items-center gap-1">
                    <Link2 className="h-3 w-3" /> Search Registered User
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsLinkedUserMode(false); setSearchQuery(''); setSearchResults([]); }}
                    className="text-[9px] font-black uppercase text-primary-100/30 hover:text-primary-100/60 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email address..."
                  className="border-primary-500/10 bg-white/[0.01] text-primary-100 placeholder:text-primary-100/20 focus-visible:ring-primary-500/20 focus-visible:border-primary-500/30 text-xs rounded-xl h-10 px-3.5"
                />
                {searching && (
                  <div className="text-[10px] text-primary-400/50 animate-pulse mt-1 pl-1">Searching directory records...</div>
                )}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 z-[100] rounded-xl border border-primary-500/15 bg-background/98 backdrop-blur-2xl shadow-2xl max-h-[160px] overflow-y-auto p-1 divide-y divide-white/5 custom-scrollbar">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        className="w-full text-left p-2.5 hover:bg-primary-500/10 rounded-lg transition-colors flex flex-col gap-0.5 group"
                      >
                        <span className="text-xs font-bold text-primary-200 group-hover:text-primary-400 transition-colors">{u.name}</span>
                        <span className="text-[10px] text-primary-100/40 group-hover:text-primary-100/65 transition-colors">{u.email}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim() && !searching && searchResults.length === 0 && (
                  <div className="text-[10px] text-destructive/70 mt-1 pl-1">No matching users found in directory.</div>
                )}
              </div>
            )}
          </div>

          {/* ── Full Name ── */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-wider text-primary-100/40 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary-500/60" />
              {connectedUserId ? 'Full Name (Optional)' : 'Full Name *'}
            </label>
            <Input
              type="text"
              required={!connectedUserId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={connectedUserId ? 'Use linked account profile name' : 'e.g. Zainab Bashir'}
              disabled={isPending}
              className="border-primary-500/10 bg-white/[0.01] text-primary-100 placeholder:text-primary-100/20 focus-visible:ring-primary-500/20 focus-visible:border-primary-500/30 disabled:opacity-50 rounded-xl h-10 px-3.5"
            />
          </div>

          {/* ── Gender segmented control ── */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-wider text-primary-100/40 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary-500/60" />
              Gender
            </label>
            <div className="flex gap-2.5">
              {(['male', 'female', 'other'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  disabled={isPending}
                  onClick={() => setGender(g)}
                  className={cn(
                    'flex-1 text-xs font-black py-2.5 px-3 rounded-xl border capitalize transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 shrink-0',
                    gender === g
                      ? g === 'male'
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/25'
                        : g === 'female'
                          ? 'bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-[0_0_12px_rgba(244,63,94,0.15)] ring-1 ring-pink-500/25'
                          : 'bg-primary-500/10 border-primary-500/40 text-primary-300 shadow-[0_0_12px_rgba(212,175,55,0.15)] ring-1 ring-primary-500/25'
                      : 'border-primary-500/10 bg-white/[0.005] text-primary-300/60 hover:bg-white/[0.02] hover:text-primary-100'
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* ── Birth Date + Time ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-wider text-primary-100/40 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary-500/60" /> Birth Date
              </label>
              <Input
                type="date"
                value={birthDate}
                disabled={isPending}
                onChange={(e) => setBirthDate(e.target.value)}
                className="border-primary-500/10 bg-white/[0.01] text-primary-100 focus-visible:ring-primary-500/20 focus-visible:border-primary-500/30 disabled:opacity-50 rounded-xl h-10 px-3.5 [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-wider text-primary-100/40 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary-500/60" /> Birth Time
              </label>
              <Input
                type="time"
                value={birthTime}
                disabled={isPending}
                onChange={(e) => setBirthTime(e.target.value)}
                className="border-primary-500/10 bg-white/[0.01] text-primary-100 focus-visible:ring-primary-500/20 focus-visible:border-primary-500/30 disabled:opacity-50 rounded-xl h-10 px-3.5 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* ── Birth Place ── */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-wider text-primary-100/40 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary-500/60" /> Birth Place
            </label>
            <Input
              type="text"
              value={birthPlace}
              disabled={isPending}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="e.g. Lahore, Pakistan"
              className="border-primary-500/10 bg-white/[0.01] text-primary-100 placeholder:text-primary-100/20 focus-visible:ring-primary-500/20 focus-visible:border-primary-500/30 disabled:opacity-50 rounded-xl h-10 px-3.5"
            />
          </div>

          {/* ── Current connections list (edit mode) ── */}
          {mode === 'edit' && member && currentConnections.length > 0 && (
            <div className="space-y-2 border-t border-primary-500/5 pt-4">
              <label className="text-[9px] font-black uppercase tracking-wider text-primary-100/40 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary-500/60" /> Current Relationships
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                {currentConnections.map((rel) => (
                  <div
                    key={rel.relationshipId}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-primary-500/10 bg-white/[0.005]"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-primary-200 truncate">{rel.relativeName}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-primary-500/60 mt-0.5">
                        {rel.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDisconnectRelationship(rel.edge)}
                      disabled={disconnectingRelId === rel.relationshipId}
                      className="p-1 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                      title="Disconnect relationship"
                    >
                      {disconnectingRelId === rel.relationshipId ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Add relationship section (create + edit modes) ── */}
          {selectableMembers.length > 0 && (
            <div className="space-y-4 border-t border-primary-500/5 pt-4 mt-4 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id="connectToRelative"
                  checked={connectToRelative}
                  onCheckedChange={(checked) => setConnectToRelative(!!checked)}
                  className="border-primary-500/20 text-primary-500 focus-visible:ring-primary-500/20 data-[state=checked]:bg-primary-500 data-[state=checked]:text-primary-950 rounded"
                />
                <label
                  htmlFor="connectToRelative"
                  className="text-xs font-bold text-primary-300 cursor-pointer select-none"
                >
                  {mode === 'edit'
                    ? 'Connect to another family member'
                    : 'Connect to an existing family member'}
                </label>
              </div>

              {connectToRelative && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* Relative selector */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-primary-100/40 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary-500/60" /> Connect to Relative *
                    </label>
                    <Select value={relativeId} onValueChange={setRelativeId}>
                      <SelectTrigger className="w-full border-primary-500/15 bg-white/[0.01] text-primary-100 focus:ring-primary-500/20 rounded-xl h-10 px-3.5">
                        <SelectValue placeholder="Select family member" />
                      </SelectTrigger>
                      <SelectContent className="border-primary-500/20 bg-background/95 backdrop-blur-2xl text-primary-100 max-h-[200px] overflow-y-auto">
                        {selectableMembers.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="focus:bg-primary-500/10 focus:text-primary-400 rounded-lg m-0.5">
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Relationship type selector */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-primary-100/40 flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-primary-500/60" /> Relationship Type *
                    </label>
                    <div className="flex rounded-xl bg-white/[0.01] border border-primary-500/10 p-1 w-full">
                      {(['spouse', 'child', 'parent'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setRelationType(type)}
                          className={cn(
                            'flex-1 text-xs font-black py-2 capitalize transition-all duration-300 rounded-lg active:scale-95',
                            relationType === type
                              ? 'bg-primary-500 text-primary-950 shadow-md shadow-primary-500/10 font-extrabold'
                              : 'text-primary-300/70 hover:text-primary-100 hover:bg-white/[0.02]'
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Single-spouse option */}
                  {relationType === 'child' && spouses.length === 1 && singleSpouse && (
                    <div className="flex items-center space-x-2.5 bg-primary-500/5 border border-primary-500/10 rounded-xl p-3 mt-2 animate-fade-in">
                      <Checkbox
                        id="connectToSpouseParent"
                        checked={connectToSpouseParent}
                        onCheckedChange={(checked) => setConnectToSpouseParent(!!checked)}
                        className="border-primary-500/20 text-primary-500 focus-visible:ring-primary-500/20 data-[state=checked]:bg-primary-500 data-[state=checked]:text-primary-950 rounded"
                      />
                      <label
                        htmlFor="connectToSpouseParent"
                        className="text-xs font-semibold text-primary-300/80 cursor-pointer select-none leading-snug"
                      >
                        Also connect to spouse,{' '}
                        <span className="font-extrabold text-primary-200">{singleSpouse.name}</span>, as the other parent
                      </label>
                    </div>
                  )}

                  {/* Multi-spouse selector */}
                  {relationType === 'child' && spouses.length > 1 && (
                    <div className="space-y-2 bg-primary-500/5 border border-primary-500/10 rounded-xl p-3 mt-2 animate-fade-in">
                      <label className="text-[9px] font-black uppercase tracking-wider text-primary-500/50 flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary-500/60" /> Select the Other Parent (Optional)
                      </label>
                      <Select value={selectedOtherParentId} onValueChange={setSelectedOtherParentId}>
                        <SelectTrigger className="w-full border-primary-500/15 bg-white/[0.01] text-primary-100 focus:ring-primary-500/20 rounded-xl h-10 px-3.5">
                          <SelectValue placeholder="Select other parent" />
                        </SelectTrigger>
                        <SelectContent className="border-primary-500/20 bg-background/95 backdrop-blur-2xl text-primary-100">
                          <SelectItem value="none" className="focus:bg-primary-500/10 focus:text-primary-400 rounded-lg m-0.5">None / Disconnected</SelectItem>
                          {spouses.map((s) => (
                            <SelectItem key={s.id} value={s.id} className="focus:bg-primary-500/10 focus:text-primary-400 rounded-lg m-0.5">
                              Spouse: {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Action footer ── */}
          <div className="flex gap-3.5 pt-3.5 border-t border-primary-500/5">
            {mode === 'edit' && member && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 text-xs font-black uppercase tracking-wider transition-transform active:scale-95 duration-200 flex items-center justify-center gap-1.5 py-5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 active:bg-destructive/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Member
              </Button>
            ) : (
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="flex-1 border-primary-500/15 bg-white/[0.005] text-primary-300 hover:bg-white/[0.02] hover:text-primary-100 text-xs font-black uppercase tracking-wider py-5 rounded-xl active:scale-95 transition-transform"
                >
                  Cancel
                </Button>
              </DialogClose>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-primary-500 text-primary-950 hover:bg-primary-600 font-black uppercase tracking-wider shadow-lg shadow-primary-500/10 text-xs disabled:opacity-50 py-5 rounded-xl active:scale-95 transition-transform"
            >
              {isPending ? 'Saving...' : mode === 'create' ? 'Create Member' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
