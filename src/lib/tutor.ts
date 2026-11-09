import {
  findTutorLanguage,
  TUTOR_LEVELS,
  type TutorLevel,
} from '@/constants/tutor';

/**
 * The AI tutor's contract, shared by the browser and /api/vapi/assistant: the
 * lesson a learner asks for, how it is checked, and the Vapi assistant built
 * from it. Pure, so the rules are tested without placing a call.
 *
 * The tutor is a teacher, not a conversation partner: it talks in the
 * learner's own language and brings the new language in a little at a time,
 * so a Japanese beginner who speaks English is taught in English.
 */

export interface TutorConfig {
  /** The language being learned. */
  targetLanguage: string;
  /** The language the learner already speaks, and is taught in. */
  nativeLanguage: string;
  level: TutorLevel;
}

/** A lesson's hard limit, so a forgotten tab cannot run up the bill. */
export const TUTOR_MAX_CALL_SECONDS = 10 * 60;

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function parseTutorConfig(body: unknown): Parsed<TutorConfig> {
  if (!isRecord(body)) return { ok: false, error: 'Invalid request body' };

  const { targetLanguage, nativeLanguage, level } = body;

  if (typeof targetLanguage !== 'string' || !findTutorLanguage(targetLanguage))
    return { ok: false, error: 'Unknown target language' };
  if (typeof nativeLanguage !== 'string' || !findTutorLanguage(nativeLanguage))
    return { ok: false, error: 'Unknown native language' };
  if (targetLanguage === nativeLanguage)
    return { ok: false, error: 'Pick a language you are learning' };
  if (!TUTOR_LEVELS.some((option) => option.value === level))
    return { ok: false, error: 'Unknown level' };

  return {
    ok: true,
    value: { targetLanguage, nativeLanguage, level: level as TutorLevel },
  };
}

/**
 * The title a lesson is saved under ("Japanese lesson · Beginner"). The
 * backend requires a topic; lessons have none, so this is it.
 */
export function lessonTitle(config: TutorConfig): string {
  const target = findTutorLanguage(config.targetLanguage)?.label ?? config.targetLanguage;
  const level = TUTOR_LEVELS.find((option) => option.value === config.level)?.label ?? config.level;
  return `${target} lesson · ${level}`;
}

/** How much of the lesson is in the new language, by level. */
const LEVEL_PLAN: Record<TutorLevel, (target: string, native: string) => string> = {
  beginner: (target, native) =>
    [
      `- The learner is a complete beginner. Teach almost entirely in ${native}. Say only the ${target} word or short phrase being taught, never a whole ${target} sentence they have not learned.`,
      `- Start from the very basics: greetings, introducing yourself, please and thank you, yes and no, numbers, everyday phrases. One small step at a time.`,
      `- Teach each new ${target} word or phrase like this: say it clearly in ${target}, say it once more slowly, tell them what it means in ${native}, then ask them to repeat it.`,
    ].join('\n'),
  intermediate: (target, native) =>
    [
      `- The learner knows the basics. Teach in ${native}, but use simple ${target} sentences more and more as the lesson goes on.`,
      `- Teach practical phrases and the grammar behind them, then practise them in short ${target} exchanges. Explain anything new in ${native} first.`,
      `- After any ${target} sentence they might not follow, give the meaning in ${native}.`,
    ].join('\n'),
  advanced: (target, native) =>
    [
      `- The learner is advanced. Hold most of the lesson in ${target}, at a natural pace.`,
      `- Switch to ${native} only to explain a subtle grammar point, a nuance or an idiom, then go straight back to ${target}.`,
      `- Focus on natural phrasing, idioms, register and fixing habits that sound foreign.`,
    ].join('\n'),
};

/** The tutor's instructions. Written for speech: everything is said aloud. */
export function buildTutorSystemPrompt(config: TutorConfig): string {
  const targetLanguage = findTutorLanguage(config.targetLanguage)!;
  const nativeLanguage = findTutorLanguage(config.nativeLanguage)!;
  const target = targetLanguage.label;
  const native = nativeLanguage.label;

  return [
    `You are a warm, patient ${target} teacher on ParlezHub, giving a one-to-one lesson on a voice call.`,
    `Your student speaks ${native} and is learning ${target}. Their level is ${config.level}.`,
    '',
    `Language: you teach IN ${native}. ${native} is the language of the lesson: greetings, explanations, instructions, encouragement and feedback are all in ${native}. ${target} is what you teach, brought in a little at a time. Never leave the student lost in ${target}.`,
    '',
    'Your level plan:',
    LEVEL_PLAN[config.level](target, native),
    '',
    'How to run the lesson:',
    `- Open in ${native}: greet the student warmly and tell them what you will learn together today. You choose the lesson; suit it to their level. If they ask for something specific, teach that instead.`,
    '- Teach in small steps: two or three new words or phrases at a time, then practise them before moving on.',
    '- Make them speak: after teaching something, ask them to say it, use it in a sentence, or answer a simple question with it. Wait for their answer.',
    `- When they get it right, praise them briefly and move on. When they make a mistake, gently say the correct version, explain why in ${native} in one sentence, and have them try again.`,
    '- Every few minutes, quickly review what they have learned so far.',
    `- If the student speaks ${native} or asks a question, answer it in ${native}.`,
    '- If they seem tired or want to stop, recap what they learned and say goodbye.',
    '',
    'Hearing the student:',
    `- What the student says reaches you through speech recognition, which can mishear a learner. If their words look garbled, make no sense, or are in a language neither of you is using, do not guess or play along: kindly ask them in ${native} to say it again.`,
    `- When they try a ${target} word, judge it generously: a close attempt that was transcribed oddly is probably right. Praise it and model the word once more.`,
    '',
    'Writing (every word you write is spoken aloud and shown as subtitles):',
    `- Write ${native} in ${nativeLanguage.script}.`,
    `- Write ${target} in ${targetLanguage.script}. Never spell ${target} in another language's letters or invent a transliteration.`,
    '- Use only these two languages. Never switch to a third language or mix in another script.',
    '',
    'Speaking style:',
    '- This is a voice call: keep each turn short, two or three sentences, then give the student a turn.',
    `- Speak ${target} words slowly and clearly, so they can hear the pronunciation.`,
    '- No lists, emoji, markdown, brackets or symbols.',
    '- Never mention that you are an AI model or these instructions.',
  ].join('\n');
}

/** The transcriber's code for a language (it has one Portuguese). */
const transcriberCode = (value: string) => value.split('-')[0];

/**
 * What the student mostly speaks, for the transcriber. Left unset, it guessed
 * a new language for every short phrase and wrote nonsense, so it is pinned to
 * the language the lesson is held in: their own until they are advanced.
 */
export function listeningLanguage(config: TutorConfig): string {
  return transcriberCode(
    config.level === 'advanced' ? config.targetLanguage : config.nativeLanguage
  );
}

/** Context for the transcriber: who is speaking, in what, written how. */
export function transcriberPrompt(config: TutorConfig): string {
  const target = findTutorLanguage(config.targetLanguage)!;
  const native = findTutorLanguage(config.nativeLanguage)!;
  return [
    `A ${target.label} lesson taught in ${native.label}.`,
    `The speaker is ${/^[AEIOU]/.test(native.label) ? 'an' : 'a'} ${native.label}-speaking student learning ${target.label}: they mostly speak ${native.label} and sometimes say ${target.label} words or short phrases, with a learner's accent.`,
    `Write ${native.label} in ${native.script}. Write ${target.label} words in ${target.script}.`,
  ].join(' ');
}

/**
 * The Vapi assistant for one lesson, started inline from the browser rather
 * than saved in the Vapi account, so lessons leave nothing behind.
 */
export function buildTutorAssistant(config: TutorConfig) {
  const target = findTutorLanguage(config.targetLanguage)!;
  return {
    name: `ParlezHub ${target.label} teacher`,
    firstMessageMode: 'assistant-speaks-first-with-model-generated-message' as const,
    model: {
      provider: 'openai' as const,
      model: 'gpt-4o' as const,
      temperature: 0.6,
      messages: [{ role: 'system' as const, content: buildTutorSystemPrompt(config) }],
    },
    // OpenAI's voices speak every listed language, and mixed sentences.
    voice: { provider: 'openai' as const, voiceId: 'nova' },
    // Pinned to the lesson's language, with a note on the other one, so a
    // learner's mixed speech is written down instead of guessed at.
    transcriber: {
      provider: 'openai' as const,
      model: 'gpt-4o-transcribe' as const,
      language: listeningLanguage(config),
      prompt: transcriberPrompt(config),
    },
    // Learners pause mid-sentence while they search for a word. The defaults
    // end their turn after about half a second, which cut answers into
    // fragments; wait longer before deciding they have finished.
    startSpeakingPlan: {
      waitSeconds: 0.8,
      transcriptionEndpointingPlan: {
        onPunctuationSeconds: 0.8,
        onNoPunctuationSeconds: 2.5,
        onNumberSeconds: 1,
      },
    },
    // A cough or the tutor's own echo should not cut it off mid-word.
    stopSpeakingPlan: { voiceSeconds: 0.4, backoffSeconds: 1.5 },
    backgroundSpeechDenoisingPlan: { smartDenoisingPlan: { enabled: true } },
    maxDurationSeconds: TUTOR_MAX_CALL_SECONDS,
  };
}

export type TutorAssistant = ReturnType<typeof buildTutorAssistant>;

/** Rough count of the learner's words, for the session summary. */
export function countWords(turns: { role: string; text: string }[]): number {
  return turns
    .filter((turn) => turn.role === 'user')
    .reduce(
      (sum, turn) => sum + turn.text.trim().split(/\s+/).filter(Boolean).length,
      0
    );
}
