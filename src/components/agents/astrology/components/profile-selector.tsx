'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronDown,
  Eye,
  LogOut,
  Pencil,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { useConsultantSharedStudents, useGuestProfiles } from '@/hooks/useAstrology';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export type ProfileType = 'me' | 'student' | 'guest';
export interface SelectedProfile { type: ProfileType; id?: string; name: string }

interface ProfileSelectorProps {
  selectedProfile: SelectedProfile;
  onSelect: (profile: SelectedProfile) => void;
  onAddGuest: () => void;
  onEditGuest: (id: string, name: string) => void;
  onDeleteGuest: (id: string, name: string) => void;
  onEditBirth: () => void;
  onManageProfiles: () => void;
}

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase() || '★';

const pad = (value: number) => String(value).padStart(2, '0');

function Avatar({ name, tone }: { name: string; tone: 'ember' | 'soft' | 'muted' }) {
  return <span aria-hidden="true" className={cn(
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
    tone === 'ember' && 'bg-[linear-gradient(135deg,var(--solar-orange),var(--solar-gold))] text-black',
    tone === 'soft' && 'border border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_14%,transparent)] text-[var(--solar-gold)]',
    tone === 'muted' && 'border border-border bg-secondary text-muted-foreground',
  )}>{initials(name)}</span>;
}

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return <div className="mb-2 mt-6 flex items-baseline justify-between gap-3">
    <h3 className="obs-label">{children}</h3>
    {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
  </div>;
}

interface ProfileRowProps {
  name: string;
  meta?: string;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ProfileRow({ name, meta, selected, onSelect, onEdit, onDelete }: ProfileRowProps) {
  return <div className={cn(
    'flex items-center gap-1 rounded-xl border px-2 py-2 transition-colors',
    selected
      ? 'border-[color-mix(in_srgb,var(--solar-orange)_55%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_12%,transparent)]'
      : 'border-transparent hover:border-border hover:bg-secondary',
  )}>
    <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 py-0.5 pl-1 text-left">
      <Avatar name={name} tone={selected ? 'ember' : 'muted'} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{name}</span>
        {meta && <span className="block truncate text-xs text-muted-foreground">{meta}</span>}
      </span>
      {selected && <Check className="h-4 w-4 shrink-0 text-[var(--solar-orange)]" aria-label="Currently viewing" />}
    </button>
    {onEdit && <button type="button" onClick={onEdit} aria-label={`Edit ${name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="h-4 w-4" /></button>}
    {onDelete && <button type="button" onClick={onDelete} aria-label={`Delete ${name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--danger)] hover:bg-accent"><Trash2 className="h-4 w-4" /></button>}
  </div>;
}

function AddProfileCard({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="mt-2 flex w-full items-center gap-3 rounded-xl border border-dashed border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_5%,transparent)] px-3 py-3 text-left transition-colors hover:border-[color-mix(in_srgb,var(--solar-orange)_65%,transparent)] hover:bg-[color-mix(in_srgb,var(--solar-orange)_10%,transparent)]">
    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)] text-[var(--solar-gold)]"><Plus className="h-4 w-4" /></span>
    <span className="min-w-0"><span className="block text-sm font-semibold text-[var(--solar-gold)]">Add a birth profile</span><span className="block text-xs text-muted-foreground">Name, date, time and place of birth</span></span>
  </button>;
}

export function ProfileSelector({ selectedProfile, onSelect, onAddGuest, onEditGuest, onDeleteGuest, onEditBirth, onManageProfiles }: ProfileSelectorProps) {
  const { canAccessRole, activeRole, logout } = useAuth();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const studentsQuery = useConsultantSharedStudents({ search: debouncedSearch, page_size: 20 }, open && canAccessRole('TEACHER'));
  const guestsQuery = useGuestProfiles({ search: debouncedSearch, page_size: 20 }, open);
  const choose = (profile: SelectedProfile) => { onSelect(profile); setOpen(false); };
  const isTeacher = canAccessRole('TEACHER');
  const accountName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'Your account';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="group flex min-h-14 w-full max-w-80 items-center gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--solar-orange)_22%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_7%,var(--surface-1))] py-2 pl-2 pr-3 text-left transition-colors hover:border-[color-mix(in_srgb,var(--solar-orange)_55%,transparent)] hover:bg-[color-mix(in_srgb,var(--solar-orange)_12%,var(--surface-1))]"
      >
        <Avatar name={selectedProfile.name} tone="ember" />
        <span className="min-w-0 flex-1">
          <span className="obs-label block">Viewing chart</span>
          <span className="block truncate text-sm font-semibold text-foreground" title={selectedProfile.name}>{selectedProfile.name}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1 rounded-lg border border-[color-mix(in_srgb,var(--solar-orange)_30%,transparent)] px-2 py-1 text-[11px] font-semibold text-[var(--solar-gold)] sm:flex">
          Switch
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[var(--solar-gold)]" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="observatory-theme flex max-h-[88dvh] w-[calc(100%-2rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--solar-orange)_25%,transparent)] bg-popover p-0 sm:rounded-2xl">
          <div className="shrink-0 border-b border-border bg-[linear-gradient(135deg,color-mix(in_srgb,var(--solar-orange)_16%,var(--surface-1)),var(--surface-1)_70%)] px-6 pb-5 pt-6 pr-14">
            <DialogTitle className="text-lg font-semibold tracking-tight">Switch birth profile</DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
              Pick whose chart you are exploring. Your signed-in account stays the same.
            </DialogDescription>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1"><Star className="h-3 w-3 text-[var(--solar-gold)]" />Your chart</span>
              {isTeacher && <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1"><UserRound className="h-3 w-3" />Shared students</span>}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1"><Plus className="h-3 w-3" />Add a profile</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-5">
            <label className="obs-search rounded-xl border border-border bg-[var(--surface-1)]">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                aria-label="Search birth profiles"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>

            <SectionTitle>Personal</SectionTitle>
            <ProfileRow
              name="My chart"
              meta="Your own birth details"
              selected={selectedProfile.type === 'me'}
              onSelect={() => choose({ type: 'me', name: 'My Chart' })}
            />

            <SectionTitle hint={isTeacher ? 'Read-only birth data' : undefined}>
              {isTeacher ? 'Students who shared with you' : 'Guest profiles'}
            </SectionTitle>

            {isTeacher && <>
              {studentsQuery.isLoading && <p role="status" className="py-3 text-sm text-muted-foreground">Loading shared profiles…</p>}
              {studentsQuery.isError && <button type="button" className="obs-control my-2" onClick={() => studentsQuery.refetch()}>Retry shared profiles</button>}
              {studentsQuery.data?.results.map(access => (
                <ProfileRow
                  key={access.student.id}
                  name={access.student.full_name}
                  meta={access.has_birth_profile ? undefined : 'No birth details yet'}
                  selected={selectedProfile.type === 'student' && selectedProfile.id === access.student.id}
                  onSelect={() => choose({ type: 'student', id: access.student.id, name: access.student.full_name })}
                />
              ))}
            </>}

            {guestsQuery.isLoading && <p role="status" className="py-3 text-sm text-muted-foreground">Loading guest profiles…</p>}
            {guestsQuery.isError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><p className="text-[var(--danger)]">Could not load guest profiles.</p><button type="button" className="obs-control" onClick={() => guestsQuery.refetch()}>Retry</button></div>}
            {guestsQuery.data?.results.length === 0 && !debouncedSearch && <p className="py-3 text-sm text-muted-foreground">No guest profiles yet — add one to explore another chart.</p>}
            {guestsQuery.data?.results.length === 0 && debouncedSearch && <p className="py-3 text-sm text-muted-foreground">No profile matches “{debouncedSearch}”.</p>}
            {guestsQuery.data?.results.map(guest => {
              const name = guest.guest_name || 'Guest';
              const meta = [`${guest.birth_year}-${pad(guest.birth_month)}-${pad(guest.birth_day)}`, guest.city].filter(Boolean).join(' · ');
              return <ProfileRow
                key={guest.id}
                name={name}
                meta={meta}
                selected={selectedProfile.type === 'guest' && selectedProfile.id === String(guest.id)}
                onSelect={() => choose({ type: 'guest', id: String(guest.id), name })}
                onEdit={() => { onEditGuest(String(guest.id), name); setOpen(false); }}
                onDelete={() => { onDeleteGuest(String(guest.id), name); setOpen(false); }}
              />;
            })}

            <AddProfileCard onClick={() => { onAddGuest(); setOpen(false); }} />

            <SectionTitle hint={accountName}>Account</SectionTitle>
            <div className="space-y-1">
              <Link
                href={activeRole === 'TEACHER' ? ROUTES.TEACHER.SETTINGS : ROUTES.STUDENT.SETTINGS}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-transparent px-3 text-sm text-foreground transition-colors hover:border-border hover:bg-secondary"
              >
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />Account settings
              </Link>
              <button
                type="button"
                disabled={loggingOut}
                onClick={async () => {
                  setLoggingOut(true);
                  try {
                    await logout();
                  } catch {
                    toast.error('Could not sign out. Please try again.');
                    setLoggingOut(false);
                  }
                }}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-transparent px-3 text-left text-sm text-[var(--danger)] transition-colors hover:border-border hover:bg-secondary disabled:opacity-60"
              >
                <LogOut className="h-4 w-4 shrink-0" />{loggingOut ? 'Signing out…' : 'Log out'}
              </button>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-[var(--surface-1)] px-6 py-4">
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><Eye className="h-3.5 w-3.5" />Switching profiles never changes your login.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="obs-control min-h-10 text-xs" onClick={() => { onManageProfiles(); setOpen(false); }}>Manage profiles</button>
              <button type="button" className="obs-button min-h-10 rounded-xl px-4 text-xs" onClick={() => { onEditBirth(); setOpen(false); }}>
                {selectedProfile.type === 'student' ? 'View birth details' : 'Edit birth details'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
