import { describe, expect, it } from 'vitest';

import { TUTOR_LANGUAGES } from '@/constants/tutor';
import {
  buildTutorAssistant,
  buildTutorSystemPrompt,
  countWords,
  lessonTitle,
  listeningLanguage,
  parseTutorConfig,
  transcriberPrompt,
  TUTOR_MAX_CALL_SECONDS,
  type TutorConfig,
} from '@/lib/tutor';

const valid = { targetLanguage: 'ja', nativeLanguage: 'en', level: 'beginner' };

const config = (patch: Partial<TutorConfig> = {}): TutorConfig => {
  const parsed = parseTutorConfig({ ...valid, ...patch });
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.value;
};

describe('parseTutorConfig', () => {
  it('accepts a lesson request and keeps only its fields', () => {
    expect(config()).toEqual(valid);
    // A topic from an older client is ignored, not an error.
    const parsed = parseTutorConfig({ ...valid, topic: 'Travel' });
    expect(parsed.ok && parsed.value).toEqual(valid);
  });

  it.each([
    ['an unknown target language', { targetLanguage: 'klingon' }],
    ['an unknown native language', { nativeLanguage: 42 }],
    ['the same language twice', { nativeLanguage: 'ja' }],
    ['an unknown level', { level: 'expert' }],
  ])('rejects %s', (_, patch) => {
    expect(parseTutorConfig({ ...valid, ...patch }).ok).toBe(false);
  });

  it('rejects a body that is not an object', () => {
    expect(parseTutorConfig(null).ok).toBe(false);
  });
});

describe('buildTutorSystemPrompt', () => {
  it("teaches in the learner's own language", () => {
    const prompt = buildTutorSystemPrompt(config());
    expect(prompt).toContain('you teach IN English');
    expect(prompt).toContain('learning Japanese');
    expect(prompt).toContain('Teach almost entirely in English');
  });

  it('brings in more of the new language as the level rises', () => {
    expect(buildTutorSystemPrompt(config({ level: 'intermediate' }))).toContain(
      'use simple Japanese sentences more and more'
    );
    expect(buildTutorSystemPrompt(config({ level: 'advanced' }))).toContain(
      'Hold most of the lesson in Japanese'
    );
  });

  it('has the teacher plan the lesson rather than ask for a topic', () => {
    expect(buildTutorSystemPrompt(config())).toContain('You choose the lesson');
  });
});

describe('listening', () => {
  it("listens for the student's own language until they are advanced", () => {
    expect(listeningLanguage(config())).toBe('en');
    expect(listeningLanguage(config({ level: 'intermediate', nativeLanguage: 'ur' }))).toBe('ur');
    expect(listeningLanguage(config({ level: 'advanced' }))).toBe('ja');
    expect(listeningLanguage(config({ level: 'advanced', targetLanguage: 'pt-br' }))).toBe('pt');
  });

  it('tells the transcriber both languages and how each is written', () => {
    const prompt = transcriberPrompt(config({ nativeLanguage: 'ur' }));
    expect(prompt).toContain('A Japanese lesson taught in Urdu');
    expect(prompt).toContain('Urdu script');
    expect(prompt).toContain('hiragana');
  });

  it('keeps every transcriber note within Vapi’s 1,024-character limit', () => {
    for (const target of TUTOR_LANGUAGES)
      for (const native of TUTOR_LANGUAGES) {
        if (target.value === native.value) continue;
        const note = transcriberPrompt(config({ targetLanguage: target.value, nativeLanguage: native.value }));
        expect(note.length).toBeLessThanOrEqual(1024);
      }
  });
});

describe('buildTutorAssistant', () => {
  it('pins the transcriber and gives learners time to finish', () => {
    const assistant = buildTutorAssistant(config({ nativeLanguage: 'ur' }));
    expect(assistant.transcriber).toMatchObject({ provider: 'openai', language: 'ur' });
    expect(assistant.startSpeakingPlan.transcriptionEndpointingPlan.onNoPunctuationSeconds).toBeGreaterThan(2);
  });

  it('writes each language in its own script', () => {
    const prompt = buildTutorSystemPrompt(config({ nativeLanguage: 'ur' }));
    expect(prompt).toContain('Write Urdu in Urdu script');
    expect(prompt).toContain('never Devanagari');
    expect(prompt).toContain('do not guess');
  });

  it('caps the lesson and lets the teacher open it', () => {
    const assistant = buildTutorAssistant(config());
    expect(assistant.maxDurationSeconds).toBe(TUTOR_MAX_CALL_SECONDS);
    expect(assistant.firstMessageMode).toBe('assistant-speaks-first-with-model-generated-message');
    expect(assistant.model.messages[0]).toEqual({
      role: 'system',
      content: buildTutorSystemPrompt(config()),
    });
  });
});

describe('lessonTitle', () => {
  it('names the saved lesson by language and level', () => {
    expect(lessonTitle(config())).toBe('Japanese lesson · Beginner');
  });
});

describe('countWords', () => {
  it("counts only the learner's words", () => {
    expect(
      countWords([
        { role: 'assistant', text: 'one two three' },
        { role: 'user', text: ' how do I say  thank you ' },
        { role: 'user', text: 'arigatou' },
      ])
    ).toBe(7);
  });
});
