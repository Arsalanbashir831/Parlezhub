import { describe, expect, it } from 'vitest';

import { chatSocketBase } from '@/lib/chat-socket-url';

describe('chatSocketBase', () => {
  it.each([
    ['http://localhost:8001', 'ws://localhost:8001/ws/chat/'],
    ['http://localhost:8001/', 'ws://localhost:8001/ws/chat/'],
    ['https://chat.shaktiwheel.in', 'wss://chat.shaktiwheel.in/ws/chat/'],
    ['https://example.com/chat-api/', 'wss://example.com/chat-api/ws/chat/'],
    ['wss://chat.example.com', 'wss://chat.example.com/ws/chat/'],
  ])('turns %s into %s', (input, expected) => {
    expect(chatSocketBase(input)).toBe(expected);
  });

  it.each([undefined, null, '', '   ', 'undefined', 'ftp://example.com', 'not a url'])(
    'gives no address for %s, instead of dialling "undefined/ws/chat/"',
    (input) => {
      expect(chatSocketBase(input)).toBeNull();
    }
  );
});
