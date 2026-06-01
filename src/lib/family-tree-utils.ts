import { FamilyMember } from '@/types/family-tree';

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

/** Fixed dimensions for every member card on the canvas (px). */
export const CARD_DIMENSIONS = {
  width: 240,
  height: 110,
} as const;

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

/**
 * Derives up-to-2-character initials from a display name.
 * Falls back to '??' when the name is null / empty.
 */
export function getInitials(name: string | null | undefined): string {
  return (name || '??')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Returns a human-readable relationship label based on role + gender.
 *   parent → Father / Mother / Parent
 *   child  → Son / Daughter / Child
 *   spouse → Spouse
 */
export function getRelationLabel(
  role: 'parent' | 'child' | 'spouse',
  gender: FamilyMember['gender']
): string {
  if (role === 'parent') {
    return gender === 'male' ? 'Father' : gender === 'female' ? 'Mother' : 'Parent';
  }
  if (role === 'child') {
    return gender === 'male' ? 'Son' : gender === 'female' ? 'Daughter' : 'Child';
  }
  return 'Spouse';
}

// ---------------------------------------------------------------------------
// Gender-based Tailwind class bundles
// ---------------------------------------------------------------------------

/** Avatar classes for the compact card (h-12 w-12 circles). */
export function getGenderAvatarClasses(gender: FamilyMember['gender']): string {
  if (gender === 'male')
    return 'bg-sky-500/10 border-sky-500/30 text-sky-400 drop-shadow-[0_0_6px_rgba(14,165,233,0.15)]';
  if (gender === 'female')
    return 'bg-pink-500/10 border-pink-500/30 text-pink-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.15)]';
  return 'bg-primary-500/5 border-primary-500/20 text-primary-300 drop-shadow-[0_0_6px_rgba(212,175,55,0.15)]';
}

/** Avatar classes for the large sidebar (h-24 w-24 circles). */
export function getGenderAvatarClassesLarge(gender: FamilyMember['gender']): string {
  if (gender === 'male')
    return 'bg-sky-500/10 border-sky-500/30 text-sky-400 drop-shadow-[0_0_12px_rgba(14,165,233,0.2)]';
  if (gender === 'female')
    return 'bg-pink-500/10 border-pink-500/30 text-pink-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.2)]';
  return 'bg-primary-500/5 border-primary-500/20 text-primary-300 drop-shadow-[0_0_12px_rgba(212,175,55,0.2)]';
}

/** Top coloured accent bar across the card header. */
export function getGenderBarClasses(gender: FamilyMember['gender']): string {
  if (gender === 'male')
    return 'bg-sky-400 drop-shadow-[0_1px_3px_rgba(14,165,233,0.3)]';
  if (gender === 'female')
    return 'bg-pink-400 drop-shadow-[0_1px_3px_rgba(244,63,94,0.3)]';
  return 'bg-primary-500 drop-shadow-[0_1px_3px_rgba(212,175,55,0.3)]';
}

/** Outer card border + hover-shadow classes for the MemberCard container. */
export function getGenderCardClasses(gender: FamilyMember['gender']): string {
  if (gender === 'male')
    return 'border-sky-500/20 hover:border-sky-500/40 hover:shadow-sky-500/5';
  if (gender === 'female')
    return 'border-pink-500/20 hover:border-pink-500/40 hover:shadow-pink-500/5';
  return 'border-primary-500/15 hover:border-primary-500/30 hover:shadow-primary-500/5';
}

/** Border classes for relationship navigation buttons (sidebar links). */
export function getGenderBorderClasses(gender: FamilyMember['gender']): string {
  if (gender === 'male') return 'border-sky-500/10 hover:border-sky-500/30';
  if (gender === 'female') return 'border-pink-500/10 hover:border-pink-500/30';
  return 'border-primary-500/10 hover:border-primary-500/30';
}

/** Background glow colour class used in the sidebar bio card. */
export function getGenderGlowClass(gender: FamilyMember['gender']): string {
  if (gender === 'male') return 'bg-sky-500';
  if (gender === 'female') return 'bg-pink-500';
  return 'bg-primary-500';
}

/** Pill badge classes for the sidebar gender label. */
export function getGenderBadgeClasses(gender: FamilyMember['gender']): string {
  if (gender === 'male') return 'bg-sky-500/5 border-sky-500/20 text-sky-400';
  if (gender === 'female') return 'bg-pink-500/5 border-pink-500/20 text-pink-400';
  return 'bg-primary-500/5 border-primary-500/20 text-primary-300';
}
