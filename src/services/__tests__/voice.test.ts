import { beforeEach, describe, expect, it, vi } from 'vitest';

import apiCaller from '@/lib/api-caller';
import { asConversationList, voiceService } from '@/services/voice';

vi.mock('@/lib/api-caller', () => ({ default: vi.fn() }));

const mockedApi = vi.mocked(apiCaller);

const row = (id: number, conversation_type: 'language' | 'astrological') => ({
  id,
  user: 'u-1',
  user_name: 'Learner',
  user_email: 'learner@example.com',
  topic: `Topic ${id}`,
  native_language: 'en',
  target_language: 'es',
  conversation_type,
  conversation_type_display: conversation_type,
  created_at: '2026-11-09T10:00:00Z',
});

beforeEach(() => mockedApi.mockReset());

describe('voiceService', () => {
  it('saves a tutor session as a language conversation', async () => {
    mockedApi.mockResolvedValue({ data: { topic: 'Travel' } } as never);

    await voiceService.createConversation({
      topic: 'Travel',
      transcription: { messages: [] },
      native_language: 'en',
      target_language: 'es',
      duration_minutes: 3,
    });

    const [url, method, body] = mockedApi.mock.calls[0];
    expect(url).toBe('/accounts/voice-conversations/');
    expect(method).toBe('POST');
    expect(body).toMatchObject({ conversation_type: 'language', topic: 'Travel' });
  });

  it('lists through the language filter and never shows astrology conversations', async () => {
    mockedApi.mockResolvedValue({ data: [row(1, 'language'), row(2, 'astrological')] } as never);

    const list = await voiceService.listConversations();

    expect(mockedApi.mock.calls[0][0]).toBe('/accounts/voice-conversations/by-type/language/');
    expect(list.map((c) => c.id)).toEqual([1]);
  });
});

describe('asConversationList', () => {
  it('reads the plain array the backend returns today', () => {
    expect(asConversationList([row(1, 'language')])).toHaveLength(1);
  });

  it('reads a paginated answer too', () => {
    expect(asConversationList({ count: 1, results: [row(1, 'language')] })).toHaveLength(1);
  });

  it('treats anything else as empty', () => {
    expect(asConversationList({ detail: 'nope' })).toEqual([]);
    expect(asConversationList(null)).toEqual([]);
  });
});
