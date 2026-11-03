// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chatService } from '@/services/chat';
import { useRealChat } from '@/hooks/useRealChat';
import type { BackendChat, ChatMessage, WebSocketMessage } from '@/types/chat';

vi.mock('@/services/chat', () => ({
  chatService: {
    getChats: vi.fn(),
    getChatMessages: vi.fn(),
    getChatPresence: vi.fn(),
    markChatRead: vi.fn(),
    createChat: vi.fn(),
    sendChatMessage: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    sendTyping: vi.fn(),
    onMessage: vi.fn(),
    onConnectionChange: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// The hook clears the sidebar unread badge through the query client, so it is
// mounted under the provider it always has in the app.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const STUDENT = 'student-1';
const CONSULTANT = 'consultant-1';

const backendChat = (overrides: Partial<BackendChat> = {}): BackendChat => ({
  id: 'chat-1',
  student_details: {
    id: STUDENT,
    name: 'Seeker',
    role: 'STUDENT',
    profile_picture: null,
  },
  teacher_details: {
    id: CONSULTANT,
    name: 'Dr. Bhava',
    role: 'TEACHER',
    profile_picture: null,
  },
  created_at: '2026-11-01T09:00:00Z',
  ...overrides,
});

const message = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'message-1',
  sender_id: CONSULTANT,
  content: 'Saturn sits in the seventh.',
  timestamp: '2026-11-02T10:00:00Z',
  attachments: [],
  ...overrides,
});

/** Handlers the service registers with the hook, captured for frame injection. */
let socketHandler: ((message: WebSocketMessage) => void) | null = null;
let connectionHandler: ((connected: boolean) => void) | null = null;

const deliver = (frame: WebSocketMessage) =>
  act(async () => {
    socketHandler?.(frame);
    await Promise.resolve();
  });

const seed = ({
  chats = [backendChat()],
  messages = [message()],
  online = [] as string[] | null,
}: {
  chats?: BackendChat[];
  messages?: ChatMessage[];
  online?: string[] | null;
} = {}) => {
  vi.mocked(chatService.getChats).mockResolvedValue(chats as never);
  vi.mocked(chatService.getChatMessages).mockResolvedValue(messages as never);
  vi.mocked(chatService.getChatPresence).mockResolvedValue(online as never);
  vi.mocked(chatService.markChatRead).mockResolvedValue(undefined);
  vi.mocked(chatService.connect).mockResolvedValue(undefined as never);
};

const mount = async () => {
  const view = renderHook(
    () => useRealChat({ currentUserId: STUDENT, currentUserRole: 'student' }),
    { wrapper }
  );
  await waitFor(() => expect(view.result.current.chats.length).toBeGreaterThan(0));

  await act(async () => {
    await view.result.current.selectChat(view.result.current.chats[0]);
  });
  return view;
};

beforeEach(() => {
  vi.clearAllMocks();
  socketHandler = null;
  connectionHandler = null;
  vi.mocked(chatService.onMessage).mockImplementation((handler) => {
    socketHandler = handler as (message: WebSocketMessage) => void;
    return () => {
      socketHandler = null;
    };
  });
  vi.mocked(chatService.onConnectionChange).mockImplementation((handler) => {
    connectionHandler = handler as (connected: boolean) => void;
    return () => {
      connectionHandler = null;
    };
  });
});

describe('presence reporting', () => {
  it('leaves the peer state unknown when the server cannot report it', async () => {
    seed({ online: null });
    const view = await mount();

    await waitFor(() =>
      expect(view.result.current.peerOnline).toBeNull()
    );
    expect(view.result.current.peerOnline).toBeNull();
  });

  it('reports offline for an empty registry rather than hiding the dot', async () => {
    seed({ online: [] });
    const view = await mount();

    await waitFor(() => expect(view.result.current.peerOnline).toBe(false));
  });

  it('reports online when the peer holds a socket', async () => {
    seed({ online: [STUDENT, CONSULTANT] });
    const view = await mount();

    await waitFor(() => expect(view.result.current.peerOnline).toBe(true));
  });

  it('follows a presence frame for the open chat', async () => {
    seed({ online: [] });
    const view = await mount();
    await waitFor(() => expect(view.result.current.peerOnline).toBe(false));

    await deliver({
      type: 'presence',
      chat_id: 'chat-1',
      online: [CONSULTANT],
      timestamp: '2026-11-02T10:30:00Z',
    });

    expect(view.result.current.peerOnline).toBe(true);
  });

  it('ignores a presence frame that names a different chat', async () => {
    seed({ online: [] });
    const view = await mount();
    await waitFor(() => expect(view.result.current.peerOnline).toBe(false));

    await deliver({
      type: 'presence',
      chat_id: 'chat-2',
      online: [CONSULTANT],
      timestamp: '2026-11-02T10:30:00Z',
    });

    expect(view.result.current.peerOnline).toBe(false);
  });

  it('re-reads the registry when the socket comes back', async () => {
    seed({ online: [] });
    const view = await mount();
    vi.mocked(chatService.getChatPresence).mockResolvedValue([CONSULTANT] as never);

    await act(async () => {
      connectionHandler?.(true);
      await Promise.resolve();
    });

    await waitFor(() => expect(view.result.current.peerOnline).toBe(true));
    expect(chatService.getChatPresence).toHaveBeenCalledTimes(2);
  });

  it('stops trusting the last answer once the socket drops', async () => {
    seed({ online: [CONSULTANT] });
    const view = await mount();
    await waitFor(() => expect(view.result.current.peerOnline).toBe(true));

    vi.mocked(chatService.getChatPresence).mockResolvedValue([] as never);
    await act(async () => {
      connectionHandler?.(false);
      await Promise.resolve();
    });

    await waitFor(() => expect(view.result.current.peerOnline).toBe(false));
  });

  it('drops a presence response that lands after the user moved on', async () => {
    seed({ online: [] });
    const view = renderHook(
      () => useRealChat({ currentUserId: STUDENT, currentUserRole: 'student' }),
      { wrapper }
    );
    await waitFor(() => expect(view.result.current.chats.length).toBe(1));

    // A slow answer for chat-1 resolving while chat-2 is open must not repaint.
    let resolveLate: (ids: string[]) => void = () => undefined;
    vi.mocked(chatService.getChatPresence).mockImplementation((chatId) => {
      if (chatId === 'chat-1') {
        return new Promise((resolve) => {
          resolveLate = resolve;
        }) as Promise<string[] | null>;
      }
      return Promise.resolve([]);
    });

    await act(async () => {
      await view.result.current.selectChat({
        ...view.result.current.chats[0],
        id: 'chat-2',
      });
    });
    await waitFor(() => expect(view.result.current.peerOnline).toBe(false));

    await act(async () => {
      resolveLate([CONSULTANT]);
      await Promise.resolve();
    });

    expect(view.result.current.peerOnline).toBe(false);
  });
});

describe('marking a thread read', () => {
  it('acknowledges the peer’s messages once the thread is open', async () => {
    seed({ messages: [message()] });
    await mount();

    await waitFor(() => expect(chatService.markChatRead).toHaveBeenCalledTimes(1));
    expect(chatService.markChatRead).toHaveBeenCalledWith('chat-1');
  });

  it('clears the unread badge for that thread', async () => {
    seed({ chats: [backendChat({ unread_count: 3 })] });
    const view = await mount();

    await waitFor(() =>
      expect(view.result.current.chats[0].unread_count).toBe(0)
    );
  });

  it('never marks read a thread that holds only our own output', async () => {
    seed({ messages: [message({ sender_id: STUDENT })] });
    await mount();
    await act(async () => {
      await Promise.resolve();
    });

    expect(chatService.markChatRead).not.toHaveBeenCalled();
  });

  it('does not acknowledge a hidden tab', async () => {
    seed();
    const visibility = vi
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('hidden');

    const view = await mount();
    await act(async () => {
      await Promise.resolve();
    });

    expect(chatService.markChatRead).not.toHaveBeenCalled();

    visibility.mockReturnValue('visible');
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });

    await waitFor(() => expect(chatService.markChatRead).toHaveBeenCalledTimes(1));
    expect(view.result.current.selectedChat?.id).toBe('chat-1');
    visibility.mockRestore();
  });

  it('acknowledges each newest peer message once, not once per render', async () => {
    seed({ messages: [message()] });
    await mount();
    await waitFor(() => expect(chatService.markChatRead).toHaveBeenCalledTimes(1));

    await deliver({
      type: 'message',
      chat_id: 'chat-1',
      id: 'message-2',
      sender_id: CONSULTANT,
      content: 'The dasha confirms it.',
      timestamp: '2026-11-02T10:10:00Z',
      is_read: false,
      read_at: null,
      attachments: [],
    });

    await waitFor(() => expect(chatService.markChatRead).toHaveBeenCalledTimes(2));

    await deliver({
      type: 'presence',
      chat_id: 'chat-1',
      online: [CONSULTANT],
      timestamp: '2026-11-02T10:11:00Z',
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(chatService.markChatRead).toHaveBeenCalledTimes(2);
  });

  it('survives a chat server without the endpoint and retries later', async () => {
    seed();
    vi.mocked(chatService.markChatRead).mockRejectedValue(
      new Error('404 Not Found')
    );

    const view = await mount();
    await waitFor(() => expect(chatService.markChatRead).toHaveBeenCalled());

    // No crash, no state damage: the badge simply stays as the list reported it.
    expect(view.result.current.chats[0].unread_count).toBeUndefined();

    vi.mocked(chatService.markChatRead).mockResolvedValue(undefined);
    await deliver({
      type: 'message',
      chat_id: 'chat-1',
      id: 'message-2',
      sender_id: CONSULTANT,
      content: 'One more.',
      timestamp: '2026-11-02T10:20:00Z',
      is_read: false,
      read_at: null,
      attachments: [],
    });

    await waitFor(() =>
      expect(chatService.markChatRead).toHaveBeenCalledTimes(2)
    );
  });
});

describe('read receipts arriving', () => {
  it('flips our own bubbles to seen on a receipt for the open chat', async () => {
    seed({
      messages: [
        message({ id: 'mine', sender_id: STUDENT, is_read: false, read_at: null }),
      ],
    });
    const view = await mount();

    await deliver({
      type: 'read',
      chat_id: 'chat-1',
      reader_id: CONSULTANT,
      read_at: '2026-11-02T11:00:00Z',
      timestamp: '2026-11-02T11:00:00Z',
    });

    expect(view.result.current.currentMessages[0].is_read).toBe(true);
    expect(view.result.current.currentMessages[0].read_at).toBe(
      '2026-11-02T11:00:00Z'
    );
    expect(view.result.current.chats[0].last_message_read).toBe(true);
  });

  it('applies a receipt for a thread we are not looking at', async () => {
    const other = backendChat({
      id: 'chat-2',
      last_message_read: false,
      last_message: 'Older thread',
    });
    seed({ chats: [backendChat(), other] });
    const view = await mount();
    expect(view.result.current.chats.length).toBe(2);

    await deliver({
      type: 'read',
      chat_id: 'chat-2',
      reader_id: CONSULTANT,
      read_at: '2026-11-02T11:00:00Z',
      timestamp: '2026-11-02T11:00:00Z',
    });

    const updated = view.result.current.chats.find((c) => c.id === 'chat-2');
    expect(updated?.last_message_read).toBe(true);
    // The open thread’s bubbles are untouched by someone else’s receipt.
    expect(view.result.current.currentMessages[0].is_read).toBeUndefined();
  });

  it('ignores a receipt that names us as the reader', async () => {
    seed({
      messages: [
        message({ id: 'mine', sender_id: STUDENT, is_read: false, read_at: null }),
      ],
    });
    const view = await mount();

    await deliver({
      type: 'read',
      chat_id: 'chat-1',
      reader_id: STUDENT,
      read_at: '2026-11-02T11:00:00Z',
      timestamp: '2026-11-02T11:00:00Z',
    });

    expect(view.result.current.currentMessages[0].is_read).toBe(false);
    expect(view.result.current.chats[0].last_message_read).toBeUndefined();
  });

  it('keeps receipts absent when the history came from a pre-receipt server', async () => {
    seed({ messages: [message({ id: 'mine', sender_id: STUDENT })] });
    const view = await mount();

    // loadMessages forwards is_read verbatim: undefined, not a fabricated false.
    expect(view.result.current.currentMessages[0].is_read).toBeUndefined();
  });
});

describe('conversation rail data', () => {
  it('orders threads by their newest message, not by creation', async () => {
    seed({
      chats: [
        backendChat({
          id: 'chat-old',
          created_at: '2026-11-02T12:00:00Z',
          last_message_timestamp: '2026-01-01T09:00:00Z',
        }),
        backendChat({
          id: 'chat-new',
          created_at: '2026-01-01T09:00:00Z',
          last_message_timestamp: '2026-11-02T12:00:00Z',
        }),
      ],
    });
    const view = renderHook(
      () => useRealChat({ currentUserId: STUDENT, currentUserRole: 'student' }),
      { wrapper }
    );
    await waitFor(() => expect(view.result.current.chats.length).toBe(2));

    // The rail renders filteredChats; raw `chats` keeps the server's order.
    expect(view.result.current.filteredChats.map((c) => c.id)).toEqual([
      'chat-new',
      'chat-old',
    ]);
  });

  it('searches the peer’s name whichever side the row stores', async () => {
    seed({
      chats: [
        backendChat({ id: 'chat-a' }),
        backendChat({
          id: 'chat-b',
          teacher_details: {
            id: 'consultant-2',
            name: 'Pandit Lal',
            role: 'TEACHER',
            profile_picture: null,
          },
        }),
      ],
    });
    const view = renderHook(
      () => useRealChat({ currentUserId: STUDENT, currentUserRole: 'student' }),
      { wrapper }
    );
    await waitFor(() => expect(view.result.current.chats.length).toBe(2));

    await act(async () => {
      view.result.current.setSearchQuery('lal');
    });

    expect(view.result.current.filteredChats.map((c) => c.id)).toEqual(['chat-b']);
  });

  it('previews a file-only thread instead of leaving it blank', async () => {
    seed({
      chats: [
        backendChat({
          last_message: null,
          last_message_timestamp: '2026-11-02T10:00:00Z',
        }),
      ],
    });
    const view = renderHook(
      () => useRealChat({ currentUserId: STUDENT, currentUserRole: 'student' }),
      { wrapper }
    );
    await waitFor(() => expect(view.result.current.chats.length).toBe(1));

    expect(view.result.current.chats[0].last_message).toBe('Sent a file');
  });

  it('re-attributes the preview when the peer replies', async () => {
    seed({
      chats: [
        backendChat({
          last_message: 'Thank you',
          last_message_sender_id: STUDENT,
          last_message_read: false,
        }),
      ],
      messages: [message({ sender_id: STUDENT, content: 'Thank you' })],
    });
    const view = await mount();

    await deliver({
      type: 'message',
      chat_id: 'chat-1',
      id: 'message-2',
      sender_id: CONSULTANT,
      content: 'The house matters more.',
      timestamp: '2026-11-02T10:40:00Z',
      is_read: false,
      read_at: null,
      attachments: [],
    });

    const room = view.result.current.chats[0];
    expect(room.last_message).toBe('The house matters more.');
    expect(room.last_message_sender_id).toBe(CONSULTANT);
  });

  it('ignores the broadcast echo of our own send', async () => {
    seed({ messages: [] });
    const view = await mount();

    await deliver({
      type: 'message',
      chat_id: 'chat-1',
      id: 'message-echo',
      sender_id: STUDENT,
      content: 'Namaste',
      timestamp: '2026-11-02T10:00:00Z',
      is_read: false,
      read_at: null,
      attachments: [],
    });

    expect(view.result.current.currentMessages).toHaveLength(0);
  });

  it('de-dupes a message delivered over both REST and the socket', async () => {
    seed({ messages: [] });
    const view = await mount();

    const frame = {
      type: 'message',
      chat_id: 'chat-1',
      id: 'message-1',
      sender_id: CONSULTANT,
      content: 'Saturn sits in the seventh.',
      timestamp: '2026-11-02T10:00:00Z',
      is_read: false,
      read_at: null,
      attachments: [],
    } as WebSocketMessage;

    await deliver(frame);
    await deliver(frame);

    expect(view.result.current.currentMessages).toHaveLength(1);
  });
});
