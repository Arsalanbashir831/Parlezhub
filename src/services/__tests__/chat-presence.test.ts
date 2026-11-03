import { beforeEach, describe, expect, it, vi } from 'vitest';

const { caller } = vi.hoisted(() => ({ caller: vi.fn() }));

vi.mock('@/lib/api-caller', () => ({
  default: vi.fn(),
  chatApiCaller: (...args: unknown[]) => caller(...args),
}));

import { chatService } from '@/services/chat';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'debug').mockImplementation(() => undefined);
});

describe('presence lookup', () => {
  it('asks the chat server about the open conversation', async () => {
    caller.mockResolvedValue({ data: { online: ['peer-1'] } });

    await expect(chatService.getChatPresence('chat-1')).resolves.toEqual(['peer-1']);
    expect(caller).toHaveBeenCalledWith('/presence/chat-1', 'GET');
  });

  it('normalises ids to strings', async () => {
    caller.mockResolvedValue({ data: { online: [1, 'peer-2'] } });

    await expect(chatService.getChatPresence('chat-1')).resolves.toEqual(['1', 'peer-2']);
  });

  it('distinguishes "nobody online" from "presence is not reported"', async () => {
    caller.mockResolvedValue({ data: { online: [] } });
    await expect(chatService.getChatPresence('chat-1')).resolves.toEqual([]);

    caller.mockResolvedValue({ data: {} });
    await expect(chatService.getChatPresence('chat-1')).resolves.toEqual([]);

    caller.mockRejectedValue(new Error('404 Not Found'));
    await expect(chatService.getChatPresence('chat-1')).resolves.toBeNull();
  });

  it('treats a dropped request as unknown rather than offline', async () => {
    caller.mockRejectedValue(new Error('network'));

    await expect(chatService.getChatPresence('chat-1')).resolves.toBeNull();
    expect(console.debug).toHaveBeenCalledWith(
      'Chat presence unavailable:',
      expect.any(Error)
    );
  });
});

describe('mark-read call', () => {
  it('posts to the receipt endpoint for that chat', async () => {
    caller.mockResolvedValue({ data: { updated: 2 } });

    await chatService.markChatRead('chat-1');

    expect(caller).toHaveBeenCalledWith('/messages/chat-1/read', 'POST', {});
  });

  it('lets a failure reach the caller so the thread can retry', async () => {
    caller.mockRejectedValue(new Error('404 Not Found'));

    await expect(chatService.markChatRead('chat-1')).rejects.toThrow('404');
  });
});
