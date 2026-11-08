'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentNav, studentNav, consultantNav } from '@/lib/nav-config';
import { chatService } from '@/services/chat';

import { AppShell } from './app-shell';

export default function AppShellClient({
  role,
  children,
}: {
  role: 'consultant' | 'student' | 'agent';
  children: React.ReactNode;
}) {
  // The sidebar badge is the only chat data the whole workspace needs, and the
  // conversation list already carries it — one cheap request, no socket.
  const chatRole =
    role === 'student' ? 'student' : role === 'consultant' ? 'teacher' : null;
  const { data: chatRooms } = useQuery({
    queryKey: ['chat-unread-badge', chatRole],
    queryFn: () => chatService.getChats(chatRole ?? undefined),
    enabled: chatRole !== null,
    staleTime: 30_000,
  });

  const unreadTotal = useMemo(
    () =>
      (chatRooms ?? []).reduce(
        (total, chat) => total + (chat.unread_count ?? 0),
        0
      ),
    [chatRooms]
  );

  const nav = useMemo(() => {
    const withBadge = (items: typeof studentNav) =>
      items.map((item) =>
        item.id === 'chat' && unreadTotal > 0
          ? { ...item, badge: unreadTotal }
          : item
      );

    if (role === 'student') return withBadge(studentNav);
    if (role === 'agent') return agentNav;
    return withBadge(consultantNav);
  }, [role, unreadTotal]);

  return (
    <AppShell
      nav={nav}
      roleLabel={
        role === 'consultant'
          ? 'Consultant'
          : role === 'student'
            ? 'End User'
            : 'Agent'
      }
    >
      {children}
    </AppShell>
  );
}
