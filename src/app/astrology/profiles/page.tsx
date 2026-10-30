'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Trash2, UsersRound } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useBirthProfile, useConsultantSharedStudents, useDeleteGuestProfile, useGuestProfiles } from '@/hooks/useAstrology';
import { useDebounce } from '@/hooks/use-debounce';
import { ROUTES } from '@/constants/routes';
import { profileHref } from '@/lib/astrology-navigation';
import { GuestProfileDialog } from '@/components/agents/astrology/components/guest-profile-dialog';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { toast } from 'sonner';

export default function BirthProfilesPage() {
  const { canAccessRole } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.toString();
  const [query, setQuery] = useState('');
  const [debounced] = useDebounce(query, 300);
  const [page, setPage] = useState(1);
  const [sharedPage, setSharedPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null);
  const personal = useBirthProfile();
  const guests = useGuestProfiles({ search: debounced, page, page_size: 12 });
  const shared = useConsultantSharedStudents({ search: debounced, page: sharedPage, page_size: 12 }, canAccessRole('TEACHER'));
  const deleteGuest = useDeleteGuestProfile();
  const href = (type: 'me' | 'guest' | 'student', id?: string, edit = false) => profileHref(edit ? ROUTES.AGENT.ASTROLOGY.PROFILE : ROUTES.AGENT.ASTROLOGY.ROOT, search, { type, id });
  const active = (type: 'me' | 'guest' | 'student', id?: string) => type === 'me' ? !searchParams.get('student_id') && !searchParams.get('guest_id') : searchParams.get(type === 'guest' ? 'guest_id' : 'student_id') === id;
  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="obs-label mb-3">Profiles and access</p><h1 className="obs-title">Your birth profiles</h1><p className="obs-muted mt-3 max-w-xl text-sm">Choose a chart to explore, update birth details, or add a guest profile.</p></div><button className="obs-button" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Add profile</button></header>
    <section className="obs-card flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="obs-label">Personal chart{active('me') ? ' · Active' : ''}</p><h2 className="mt-2 text-lg font-medium">{personal.data?.user_name || 'My Chart'}</h2><p className="mt-2 text-xs text-muted-foreground">{personal.isLoading ? 'Loading…' : personal.data ? `${personal.data.city}, ${personal.data.country_code} · ${personal.data.timezone_str}` : personal.isError ? 'Could not load your details.' : 'Birth details have not been added yet.'}</p></div><div className="flex flex-wrap gap-2">{personal.isError ? <button className="obs-control" onClick={() => personal.refetch()}>Retry</button> : <><Link className="obs-control" href={href('me')}>View chart</Link><Link className="obs-control" href={href('me', undefined, true)}>{personal.data ? 'Edit details' : 'Add details'}</Link></>}</div></section>
    <label className="flex max-w-xl flex-col gap-2 text-xs text-muted-foreground">Search profiles<input className="obs-control justify-start" value={query} onChange={event => { setQuery(event.target.value); setPage(1); setSharedPage(1); }} placeholder="Search guest and shared profiles…" /></label>
    <section><h2 className="mb-4 text-lg font-medium">Guest profiles{guests.data ? ` (${guests.data.count})` : ''}</h2>
      {guests.isLoading && <p role="status" className="obs-card p-8">Loading guest profiles…</p>}
      {guests.isError && <div className="obs-card p-6" role="alert"><p>Could not load guest profiles.</p><button className="obs-control mt-3" onClick={() => guests.refetch()}>Retry</button></div>}
      {guests.data?.results.length === 0 && <div className="obs-card p-8"><UsersRound className="mb-3 h-6 w-6 text-muted-foreground" /><p className="text-sm">{query ? 'No matching guest profiles.' : 'No guest profiles yet. Add one to explore another chart.'}</p></div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{guests.data?.results.map(guest => <article className="obs-card flex min-w-0 flex-col p-5" key={guest.id}>
        <div className="flex items-start justify-between gap-2"><h3 className="break-words text-lg font-medium">{guest.guest_name || 'Guest'}</h3>{active('guest', String(guest.id)) && <span className="shrink-0 text-xs text-[var(--solar-gold)]">Active</span>}</div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{guest.city}, {guest.country_code} · {guest.timezone_str}</p>
        <div className="mt-5 flex flex-wrap gap-2"><Link className="obs-control text-xs" href={href('guest', String(guest.id))}>View chart</Link><Link className="obs-control text-xs" href={href('guest', String(guest.id), true)}>Edit details</Link><button className="obs-control ml-auto w-11 p-0 text-[var(--danger)]" aria-label={`Delete ${guest.guest_name || 'guest'}`} onClick={() => setDeleting({ id: guest.id, name: guest.guest_name || 'Guest' })}><Trash2 className="h-4 w-4" /></button></div>
      </article>)}</div>
      {guests.data && (guests.data.previous || guests.data.next) && <div className="mt-4 flex items-center gap-3"><button className="obs-control" disabled={!guests.data.previous} onClick={() => setPage(value => value - 1)}>Previous</button><span className="text-xs text-muted-foreground">Page {page}</span><button className="obs-control" disabled={!guests.data.next} onClick={() => setPage(value => value + 1)}>Next</button></div>}
    </section>
    {canAccessRole('TEACHER') && <section><h2 className="mb-2 text-lg font-medium">Shared profiles</h2><p className="obs-muted mb-4 text-sm">These profiles were shared with your account. Birth details are read-only.</p>
      {shared.isLoading && <p role="status">Loading shared profiles…</p>}{shared.isError && <div role="alert"><p>Could not load shared profiles.</p><button className="obs-control mt-3" onClick={() => shared.refetch()}>Retry</button></div>}
      {shared.data?.results.length === 0 && <p className="text-sm text-muted-foreground">No shared profiles found.</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{shared.data?.results.map(access => <article className="obs-card p-5" key={access.id}><h3 className="break-words text-base font-medium">{access.student.full_name}</h3><p className="mt-2 text-xs text-muted-foreground">{active('student', access.student.id) ? 'Active · ' : ''}Read-only{!access.has_birth_profile ? ' · Birth details not available' : ''}</p><div className="mt-5 flex flex-wrap gap-2"><Link className="obs-control text-xs" href={href('student', access.student.id)}>View chart</Link><Link className="obs-control text-xs" href={href('student', access.student.id, true)}>View details</Link></div></article>)}</div>
      {shared.data && (shared.data.previous || shared.data.next) && <div className="mt-4 flex items-center gap-3"><button className="obs-control" disabled={!shared.data.previous} onClick={() => setSharedPage(value => value - 1)}>Previous</button><span className="text-xs text-muted-foreground">Page {sharedPage}</span><button className="obs-control" disabled={!shared.data.next} onClick={() => setSharedPage(value => value + 1)}>Next</button></div>}
    </section>}
    <GuestProfileDialog isOpen={addOpen} onClose={() => setAddOpen(false)} onSuccess={created => router.push(href('guest', String(created.id)))} />
    <ConfirmationDialog isOpen={!!deleting} onClose={() => { if (!deleteGuest.isPending) setDeleting(null); }} title="Delete guest profile?" description={`Delete ${deleting?.name || 'this guest'}’s birth profile? This cannot be undone.`} isLoading={deleteGuest.isPending} confirmText="Delete profile" onConfirm={() => {
      if (!deleting) return;
      deleteGuest.mutate(deleting.id, { onSuccess: () => { if (active('guest', String(deleting.id))) router.replace(profileHref(ROUTES.AGENT.ASTROLOGY.PROFILES, search, { type: 'me' })); setDeleting(null); }, onError: () => toast.error('Could not delete this profile. Please try again.') });
    }} />
  </div>;
}
