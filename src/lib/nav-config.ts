'use client';

import { ROUTES } from '@/constants/routes';
import {
  Briefcase,
  Calendar,
  FileText,
  Hand,
  History,
  Home,
  Languages,
  MessageCircle,
  Settings,
  Telescope,
  Users,
  Zap,
} from 'lucide-react';

import { NavItem } from '@/types/nav';

export const agentNav: NavItem[] = [
  {
    id: 'language',
    label: 'Language',
    icon: Languages,
    href: ROUTES.AGENT.LANGUAGE,
  },
  // {
  //   id: 'astrology',
  //   label: 'Astrology',
  //   icon: Telescope,
  //   href: ROUTES.AGENT.ASTROLOGY,
  // },
];

export const studentNav: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: ROUTES.STUDENT.DASHBOARD,
  },
  {
    id: 'language',
    label: 'AI-Tutors',
    icon: Zap,
    href: ROUTES.AGENT.LANGUAGE,
  },
  {
    id: 'teachers',
    label: 'Teachers',
    icon: Users,
    href: ROUTES.STUDENT.TEACHERS,
  },

  // {
  //   id: 'ai-agents',
  //   label: 'AI-Agents',
  //   icon: Zap,
  //   subItems: [
  //     {
  //       id: 'ai-tutor',
  //       label: 'AI Tutor',
  //       icon: Zap,
  //       href: ROUTES.STUDENT.AI_TUTOR,
  //     },
  //     {
  //       id: 'ai-chirologist',
  //       label: 'AI Chirologist',
  //       icon: Hand,
  //       href: ROUTES.STUDENT.AI_CHIROLOGIST,
  //     },
  //   ],
  // },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    href: ROUTES.STUDENT.CHAT,
    badge: 3,
  },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: Calendar,
    href: ROUTES.STUDENT.MEETINGS,
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    href: ROUTES.STUDENT.HISTORY,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: ROUTES.STUDENT.SETTINGS,
  },
];

export const teacherNav: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: ROUTES.TEACHER.DASHBOARD,
  },
  {
    id: 'services',
    label: 'Services',
    icon: Briefcase,
    href: ROUTES.TEACHER.SERVICES,
  },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: Calendar,
    href: ROUTES.TEACHER.MEETINGS,
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    href: ROUTES.TEACHER.CHAT,
    badge: 5,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: ROUTES.TEACHER.SETTINGS,
  },
];
