import type { DriveStep } from 'driver.js';

import type { NavItem } from '@/types/nav';
import { ROUTES } from '@/constants/routes';

export type GuideScope = 'observatory' | 'workspace';
export type GuideRole = 'student' | 'consultant' | 'agent';

const STORAGE_PREFIX = 'shakti-wheel:guide';

export const guideStorageKey = (scope: GuideScope, role: GuideRole) =>
  `${STORAGE_PREFIX}:${scope}:${role}`;

/* ------------------------------------------------------------------ *
 * Anchor ids — every highlighted element carries data-tour="<id>"
 * ------------------------------------------------------------------ */

export const OBS_ANCHORS = {
  brand: 'obs-brand',
  nav: 'obs-nav',
  /** The consultant-only Astrologer Service group inside the observatory sidebar. */
  service: 'obs-service-group',
  profileSelector: 'obs-profile-selector',
  guide: 'obs-guide',
  content: 'obs-content',
} as const;

export const WORKSPACE_ANCHORS = {
  brand: 'ws-brand',
  nav: (id: string) => `ws-nav-${id}`,
  toggle: 'ws-toggle',
  header: 'ws-header',
  userCard: 'ws-user-card',
  roleSwitch: 'ws-role-switch',
  signOut: 'ws-sign-out',
  guide: 'ws-guide',
  content: 'ws-content',
} as const;

interface ObservatoryNavItem {
  id: string;
  path: string;
  /** Only students see the Hire Astrologer group. */
  hire?: boolean;
  /** Only astrologers see the Astrologer Service group. */
  service?: boolean;
}

const OBS_NAV_ITEMS: ObservatoryNavItem[] = [
  { id: 'obs-dashboard', path: ROUTES.AGENT.ASTROLOGY.ROOT },
  { id: 'obs-analysis', path: ROUTES.AGENT.ASTROLOGY.ANALYSIS },
  { id: 'obs-dasha', path: ROUTES.AGENT.ASTROLOGY.DASHA },
  { id: 'obs-festivals', path: ROUTES.AGENT.ASTROLOGY.FESTIVAL_CALENDAR },
  { id: 'obs-ai-chat', path: ROUTES.AGENT.ASTROLOGY.CHAT },
  { id: 'obs-reports', path: ROUTES.AGENT.ASTROLOGY.REPORTS },
  { id: 'obs-astrologers', path: ROUTES.AGENT.ASTROLOGY.ASTROLOGERS, hire: true },
  { id: 'obs-hire-chat', path: ROUTES.AGENT.ASTROLOGY.HIRE.CHAT, hire: true },
  { id: 'obs-hire-meetings', path: ROUTES.AGENT.ASTROLOGY.HIRE.MEETINGS, hire: true },
  { id: 'obs-service-create', path: ROUTES.AGENT.ASTROLOGY.SERVICE.CREATE_GIG, service: true },
  { id: 'obs-service-gigs', path: ROUTES.AGENT.ASTROLOGY.SERVICE.GIGS, service: true },
  { id: 'obs-service-chats', path: ROUTES.AGENT.ASTROLOGY.SERVICE.CHAT, service: true },
  { id: 'obs-service-meetings', path: ROUTES.AGENT.ASTROLOGY.SERVICE.MEETINGS, service: true },
  { id: 'obs-profiles', path: ROUTES.AGENT.ASTROLOGY.PROFILES },
  { id: 'obs-share', path: ROUTES.AGENT.ASTROLOGY.SHARE },
];

/** Sidebar link path -> anchor id, so PrimarySidebar can look itself up. */
const OBS_NAV_BY_PATH: Record<string, string> = Object.fromEntries(
  OBS_NAV_ITEMS.map(({ id, path }) => [path, id]),
);

export const observatoryNavAnchor = (path: string): string | undefined =>
  OBS_NAV_BY_PATH[path];

/* ------------------------------------------------------------------ *
 * Copy
 * ------------------------------------------------------------------ */

interface GuideCopy {
  title: string;
  description: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

const OBS_NAV_COPY: Record<string, GuideCopy> = {
  'obs-dashboard': {
    title: 'Dashboard — your day in the sky',
    description:
      'Your chart at a glance: today’s transits, upcoming periods and shortcuts into every reading. Everything else in this sidebar starts from here.',
  },
  'obs-analysis': {
    title: 'Chart Analysis',
    description:
      'Topic-by-topic readings built from your own birth chart — Lagna, planets, yogas and divisional charts. Open a topic to read it, then ask the AI astrologer follow-ups about that exact area.',
  },
  'obs-dasha': {
    title: 'Dasha Timeline',
    description:
      'Your Vimshottari Dasha periods on a scrollable timeline. Select any Mahadasha or Antardasha to read what that window is about.',
  },
  'obs-festivals': {
    title: 'Festival Calendar',
    description:
      'Vedic festivals computed for your chart, location and timezone — with dates, tithis and suggested observances.',
  },
  'obs-ai-chat': {
    title: 'AI Vedic Astrologer',
    description:
      'A conversation grounded in your chart, not generic text. Ask anything; the answers cite your placements. Sessions are saved so you can continue later.',
  },
  'obs-reports': {
    title: 'My Reports',
    description:
      'Formatted PDF reports generated from your chart data. Generate once, download or revisit any time.',
  },
  'obs-astrologers': {
    title: 'Find Astrologer',
    description:
      'Browse astrologers, compare specialties, then message or book from a profile. Access to your chart is only granted from Share Access — never automatically.',
  },
  'obs-hire-chat': {
    title: 'Chat with your astrologer',
    description:
      'Conversations sit in the left rail, the thread on the right. Send messages and attachments, and when a booking card arrives you approve or pay it inline — no leaving chat.',
  },
  'obs-hire-meetings': {
    title: 'Meetings',
    description:
      'Every scheduled consultation in one list. The join button activates at the session time; past sessions stay here for reference.',
  },
  'obs-service-create': {
    title: 'Create Gig',
    description:
      'One offering, priced and timed. The card beside the form is what a student reads before booking you, and it updates as you type.',
  },
  'obs-service-gigs': {
    title: 'My Gigs',
    description:
      'Everything you offer, with its sessions and earnings. Pause a gig and it leaves your profile without losing its history.',
  },
  'obs-service-chats': {
    title: 'Student chats',
    description:
      'Every conversation on one side, the thread on the other. Approve a booking or send a payment request without leaving the page.',
  },
  'obs-service-meetings': {
    title: 'Your schedule',
    description:
      'Requests waiting on you, sessions coming up, and completed ones with their earnings. Approving a booking here confirms it in chat too.',
  },
  'obs-profiles': {
    title: 'Birth Profiles',
    description:
      'Manage your own birth details plus guest profiles. The profile you pick in the header is the chart every page reads.',
  },
  'obs-share': {
    title: 'Share Access',
    description:
      'Grant an astrologer access to your chart by searching their name or email, and revoke it from the same row. Only granted astrologers appear in a consultant’s student list.',
  },
};

const OBS_PAGE_COPY: Record<string, GuideCopy> = {
  [ROUTES.AGENT.ASTROLOGY.ANALYSIS]: {
    title: 'You are in Chart Analysis',
    description:
      'Pick a topic card to open its reading, or use the AI astrologer in the sidebar to ask about it directly.',
  },
  [ROUTES.AGENT.ASTROLOGY.DASHA]: {
    title: 'You are on the Dasha Timeline',
    description:
      'Click any period for its interpretation; the current period is marked for you.',
  },
  [ROUTES.AGENT.ASTROLOGY.CHAT]: {
    title: 'You are in the AI Vedic Astrologer',
    description:
      'Ask about a placement, a period, or a question from your chart. Each session is stored in your history.',
  },
  [ROUTES.AGENT.ASTROLOGY.HIRE.CHAT]: {
    title: 'This is the consultation chat',
    description:
      'The rail lists your conversations, the thread keeps day separators and shows when the other side is typing. Attachments, booking approvals and payments all happen inline.',
  },
  [ROUTES.AGENT.ASTROLOGY.ASTROLOGERS]: {
    title: 'This is the astrologer directory',
    description:
      'Open a profile to see specialties and rates, then start a chat or book a session.',
  },
  [ROUTES.AGENT.ASTROLOGY.SERVICE.GIGS]: {
    title: 'This is your gig list',
    description:
      'Each card is one offering with its price, length and sessions. Edit it, pause it, or add another — students book from what is active.',
  },
  [ROUTES.AGENT.ASTROLOGY.SERVICE.CREATE_GIG]: {
    title: 'This is the gig composer',
    description:
      'Fill the fields on the left; the student-facing card on the right follows every keystroke. Publish when it reads like something you would book.',
  },
  [ROUTES.AGENT.ASTROLOGY.SERVICE.CHAT]: {
    title: 'This is your student inbox',
    description:
      'Unseen counts in the rail, an online dot in the header, and the booking request you approve or decline inline — the same chat your students use.',
  },
  [ROUTES.AGENT.ASTROLOGY.SERVICE.MEETINGS]: {
    title: 'This is your schedule',
    description:
      'Requests waiting on you, sessions coming up, and completed ones with their earnings. Approving a booking here also confirms it in chat.',
  },
  [ROUTES.AGENT.ASTROLOGY.SHARE]: {
    title: 'This is Share Access',
    description:
      'Search an astrologer by name or email, grant access, and revoke it later — the list above shows everyone who can currently read your chart.',
  },
};

const WORKSPACE_NAV_COPY: Record<string, GuideCopy> = {
  dashboard: {
    title: 'Dashboard',
    description:
      'Your workspace home: activity, upcoming sessions and the numbers that matter for your account.',
  },
  language: {
    title: 'AI-Tutors',
    description:
      'Conversational tutors that teach a subject step by step. Useful when you want to learn, not just get a reading.',
  },
  consultants: {
    title: 'Find Astrologer',
    description:
      'Browse astrologers and open a profile to message or book one. This is the same directory as the Observatory sidebar.',
  },
  chat: {
    title: 'Chat',
    description:
      'Conversations in the left rail, thread on the right. The sidebar badge counts unseen messages, the header dot says whether the other person is connected, and your own last message ticks over to Seen when they open it.',
  },
  meetings: {
    title: 'Meetings',
    description:
      'Scheduled sessions with their status. Join when the time arrives and review what happened afterwards.',
  },
  history: {
    title: 'History',
    description:
      'A timeline of past readings and sessions — reopen any entry for its chart analysis and notes.',
  },
  settings: {
    title: 'Settings',
    description:
      'Profile, birth details and notification preferences live here.',
  },
  'create-gig': {
    title: 'Create Gig',
    description:
      'One offering, priced and timed. The preview on the right is exactly what a student reads before booking you.',
  },
  services: {
    title: 'My Gigs',
    description:
      'Everything you offer, with its bookings, earnings and status. Pause a gig and it stops appearing on your profile without deleting its history.',
  },
  'obs-chart': {
    title: 'My Chart',
    description:
      'Your own observatory — the birth chart every reading on this side is built from.',
  },
  'obs-analysis': {
    title: 'Chart Analysis',
    description:
      'House-by-house readings of a chart. Open it here, or pick a student who shared their chart from the profile switcher.',
  },
  'obs-dasha': {
    title: 'Dasha Timeline',
    description:
      'The planetary periods and what each one is timed for — useful in any session you take.',
  },
  'obs-reports': {
    title: 'My Reports',
    description:
      'Every reading generated for your own chart, kept so you can compare against what you tell a student.',
  },
};

/* ------------------------------------------------------------------ *
 * Step builders
 * ------------------------------------------------------------------ */

const step = (
  element: string,
  copy: GuideCopy,
  side: 'top' | 'right' | 'bottom' | 'left' = 'right',
  align: 'start' | 'center' | 'end' = 'start',
): DriveStep => ({
  element: `[data-tour="${element}"]`,
  popover: { ...copy, side: copy.side ?? side, align: copy.align ?? align },
});

/** Cards-only fallback so the tour still works on small screens, where the
 *  sidebar lives in a sheet and cannot be highlighted. */
export const narrateOnly = (steps: DriveStep[]): DriveStep[] =>
  steps.map(({ popover, ...rest }) => ({
    ...rest,
    popover: popover && { ...popover, side: 'top', align: 'center' },
  }));

export const buildObservatorySteps = (
  pathname: string,
  opts: { showHire: boolean; showService: boolean },
): DriveStep[] => {
  const visibleNav = OBS_NAV_ITEMS.filter(
    (item) => (!item.hire || opts.showHire) && (!item.service || opts.showService),
  );

  const steps: DriveStep[] = [
    step(OBS_ANCHORS.brand, {
      title: 'Welcome to Shakti Wheel',
      description:
        'Your personal Vedic observatory. This 60-second tour walks through the sidebar, the chart switcher and what each section is for. Next moves forward; Escape ends it any time.',
    }),
    step(OBS_ANCHORS.nav, {
      title: 'Everything lives in this sidebar',
      description: opts.showService
        ? 'Three groups: Explore your own chart, Astrologer Service for your gigs, students and schedule, and Profiles and access for birth data and who may read it.'
        : 'Three groups: Explore your own chart, Hire Astrologer for human sessions, and Profiles and access for birth data and who may read it.',
    }),
  ];

  for (const { id } of visibleNav) {
    const copy = OBS_NAV_COPY[id];
    if (copy) steps.push(step(id, copy));
  }

  if (opts.showService) {
    steps.push(
      step(OBS_ANCHORS.service, {
        title: 'Your work with students, from here',
        description:
          'Gigs, the student inbox and your schedule — these pages sit in the observatory, so running a practice never costs a trip out of your chart.',
      }),
    );
  }

  steps.push(
    step(OBS_ANCHORS.profileSelector, {
      title: 'The chart switcher',
      description:
        'This controls whose chart the whole app is reading: yours, a student who shared access, or a guest profile you added. Switch it and every page re-reads that chart.',
      side: 'bottom',
      align: 'end',
    }),
  );

  const pageCopy = OBS_PAGE_COPY[pathname];
  steps.push(
    step(OBS_ANCHORS.content, pageCopy ?? {
      title: 'This is the reading area',
      description:
        'Page content renders here, one section at a time. Use the sidebar to move between readings, and the AI astrologer whenever you want a follow-up.',
      side: 'left',
      align: 'center',
    }),
  );

  return steps;
};

export const buildWorkspaceSteps = (
  role: GuideRole,
  nav: NavItem[],
): DriveStep[] => {
  const steps: DriveStep[] = [
    step(WORKSPACE_ANCHORS.brand, {
      title: `Welcome to your ${role === 'consultant' ? 'consultant' : role === 'agent' ? 'agent' : 'student'} workspace`,
      description:
        'A quick walk through the sidebar, the header and where the important actions live. Next moves forward; Escape ends the tour any time.',
    }),
    step(WORKSPACE_ANCHORS.toggle, {
      title: 'Collapse or open the sidebar',
      description:
        'This toggles the sidebar down to icons when you want more room. Your choice is remembered.',
      side: 'bottom',
      align: 'start',
    }),
    step(WORKSPACE_ANCHORS.header, {
      title: 'Where you are',
      description:
        'The header names the current section and shows your account. Pages always open in the area to the right of the sidebar.',
      side: 'bottom',
      align: 'end',
    }),
  ];

  for (const item of nav) {
    if (!item.href) continue;
    steps.push(
      step(WORKSPACE_ANCHORS.nav(item.id), WORKSPACE_NAV_COPY[item.id] ?? {
        title: item.label,
        description: 'Open this section any time from the sidebar.',
      }),
    );
    for (const sub of item.subItems ?? []) {
      if (!sub.href) continue;
      steps.push(
        step(WORKSPACE_ANCHORS.nav(sub.id), WORKSPACE_NAV_COPY[sub.id] ?? {
          title: sub.label,
          description: `Part of ${item.label}.`,
        }),
      );
    }
  }

  if (role !== 'agent') {
    steps.push(
      step(WORKSPACE_ANCHORS.roleSwitch, {
        title: 'Switch roles without signing out',
        description:
          'If you hold both roles, this jumps between the student and consultant workspace instantly.',
      }),
      step(WORKSPACE_ANCHORS.nav('astrology'), {
        title: 'Your own chart lives here',
        description:
          'This opens the Observatory — birth chart, Chart Analysis, Dasha timeline, reports and the AI astrologer for your own chart.',
      }),
      step(WORKSPACE_ANCHORS.userCard, {
        title: 'Your account',
        description:
          'Name, avatar and role. Settings in the sidebar is where you edit birth details and notifications.',
      }),
      step(WORKSPACE_ANCHORS.signOut, {
        title: 'Sign out',
        description: 'Ends your session. This tour will not press it for you.',
        side: 'top',
      }),
    );
  }

  steps.push(
    step(WORKSPACE_ANCHORS.content, {
      title: 'This is the page area',
      description:
        'Whatever section you pick opens here. The tour can be restarted any time from the sidebar footer.',
      side: 'left',
      align: 'center',
    }),
  );

  return steps;
};
