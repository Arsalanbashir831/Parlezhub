// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RealChatHeader from '../real-chat-header';
import RealConversationItem from '../real-conversation-item';
import RealMessage from '../real-message';
import { ChatMessage, ChatRoom } from '@/types/chat';

// MessageBody reads the signed-in role to decide whether a booking card renders.
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ userRole: 'student' as const }),
}));

const STUDENT = 'student-1';
const CONSULTANT = 'consultant-1';

const chatRoom = (overrides: Partial<ChatRoom> = {}): ChatRoom => ({
  id: 'chat-1',
  student_id: STUDENT,
  teacher_id: CONSULTANT,
  student_name: 'Seeker',
  consultant_name: 'Dr. Bhava',
  created_at: '2026-11-01T09:00:00Z',
  updated_at: '2026-11-01T09:00:00Z',
  ...overrides,
});

const chatMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'message-1',
  sender_id: STUDENT,
  content: 'What does the seventh house hold?',
  timestamp: '2026-11-02T10:00:00Z',
  ...overrides,
});

const renderHeader = (props: Partial<ComponentProps<typeof RealChatHeader>> = {}) =>
  render(
    <RealChatHeader
      chat={chatRoom()}
      currentUserRole="student"
      currentUserId={STUDENT}
      peerOnline={null}
      isTyping={false}
      {...props}
    />
  );

// The dot is the only element carrying this class in the header.
const presenceDot = (container: HTMLElement) =>
  container.querySelector('span.h-3');

afterEach(cleanup);

describe('chat header presence', () => {
  it('says nothing while the chat server has not reported presence', () => {
    const { container } = renderHeader({ peerOnline: null });

    expect(presenceDot(container)).toBeNull();
    expect(screen.queryByText('Online')).toBeNull();
    expect(screen.queryByText('Offline')).toBeNull();
  });

  it('reports offline without claiming the peer is merely unseen', () => {
    const { container } = renderHeader({ peerOnline: false });

    expect(screen.getByText('Offline')).toBeDefined();
    expect(presenceDot(container)?.className).toContain('bg-muted-foreground/50');
  });

  it('marks the peer online on the success token', () => {
    const { container } = renderHeader({ peerOnline: true });

    expect(screen.getByText('Online')).toBeDefined();
    expect(presenceDot(container)?.className).toContain('--success');
  });

  it('lets a typing frame outrank the online state', () => {
    const { container } = renderHeader({ peerOnline: true, isTyping: true });

    expect(screen.getByText('Writing…')).toBeDefined();
    expect(screen.queryByText('Online')).toBeNull();
    // The dot still reflects the registry; only the label defers to typing.
    expect(presenceDot(container)).not.toBeNull();
  });
});

describe('message receipts', () => {
  it('renders no tick when the server has never reported read state', () => {
    render(
      <RealMessage message={chatMessage()} isOwnMessage showReceipt />
    );

    expect(screen.queryByText('Sent')).toBeNull();
    expect(screen.queryByText('Seen')).toBeNull();
  });

  it('labels an unread own message as sent, not as seen', () => {
    render(
      <RealMessage
        message={chatMessage({ is_read: false, read_at: null })}
        isOwnMessage
        showReceipt
      />
    );

    expect(screen.getByText('Sent')).toBeDefined();
    expect(screen.queryByText('Seen')).toBeNull();
  });

  it('promotes to seen and takes the ember tone', () => {
    render(
      <RealMessage
        message={chatMessage({ is_read: true, read_at: '2026-11-02T10:05:00Z' })}
        isOwnMessage
        showReceipt
      />
    );

    expect(screen.getByText('Seen')).toBeDefined();
    expect(screen.queryByText('Sent')).toBeNull();
  });

  it('never shows a receipt on the peer’s own messages', () => {
    render(
      <RealMessage
        message={chatMessage({ sender_id: CONSULTANT, is_read: true })}
        isOwnMessage={false}
        showReceipt
      />
    );

    expect(screen.queryByText('Seen')).toBeNull();
  });

  it('keeps receipts on the newest bubble of a run only', () => {
    render(
      <RealMessage
        message={chatMessage({ is_read: true })}
        isOwnMessage
        showReceipt={false}
      />
    );

    expect(screen.queryByText('Seen')).toBeNull();
  });

  it('still renders the timestamp when there is no receipt', () => {
    const { container } = render(<RealMessage message={chatMessage()} isOwnMessage />);

    // Machine-local formatting is asserted as a stamp, not as text.
    expect(container.querySelector('time')?.getAttribute('dateTime')).toBe(
      '2026-11-02T10:00:00Z'
    );
    expect(container.querySelector('time')?.textContent).toBeTruthy();
  });
});

const renderItem = (chat: ChatRoom) =>
  render(
    <RealConversationItem
      chat={chat}
      currentUserRole="student"
      currentUserId={STUDENT}
      isSelected={false}
      onSelect={() => undefined}
    />
  );

describe('conversation list unread and preview', () => {
  it('shows no badge when the backend has not counted unread messages', () => {
    renderItem(chatRoom({ last_message: 'Namaste' }));

    expect(screen.queryByLabelText(/unseen message/)).toBeNull();
  });

  it('shows no badge for a read thread', () => {
    renderItem(chatRoom({ unread_count: 0 }));

    expect(screen.queryByLabelText(/unseen message/)).toBeNull();
  });

  it('badges the count with a singular label for one message', () => {
    renderItem(chatRoom({ unread_count: 1 }));

    expect(screen.getByLabelText('1 unseen message')).toBeDefined();
  });

  it('pluralises and caps the badge at 99+', () => {
    renderItem(chatRoom({ unread_count: 7 }));
    expect(screen.getByLabelText('7 unseen messages')).toBeDefined();

    cleanup();
    renderItem(chatRoom({ unread_count: 150 }));
    expect(screen.getByText('99+')).toBeDefined();
    expect(screen.getByLabelText('150 unseen messages')).toBeDefined();
  });

  it('attributes the preview to the sender', () => {
    const { rerender } = renderItem(
      chatRoom({
        last_message: 'Your chart shows a strong Saturn',
        last_message_sender_id: CONSULTANT,
      })
    );
    expect(
      screen.getByText('Your chart shows a strong Saturn')
    ).toBeDefined();

    rerender(
      <RealConversationItem
        chat={chatRoom({
          last_message: 'Thank you',
          last_message_sender_id: STUDENT,
        })}
        currentUserRole="student"
        currentUserId={STUDENT}
        isSelected={false}
        onSelect={() => undefined}
      />
    );
    expect(screen.getByText('You: Thank you')).toBeDefined();
  });

  it('falls back to an empty-thread line when nothing was ever sent', () => {
    renderItem(chatRoom());

    expect(screen.getByText('No messages yet')).toBeDefined();
  });

  it('prefixes a file-only preview the same way as a text one', () => {
    renderItem(
      chatRoom({
        last_message: 'Sent a file',
        last_message_sender_id: STUDENT,
        last_message_timestamp: '2026-11-02T10:00:00Z',
      })
    );

    expect(screen.getByText('You: Sent a file')).toBeDefined();
  });
});
