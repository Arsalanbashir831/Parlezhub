/**
 * The AI language tutor's choices. Kept free of React so the tutor API route
 * validates against the same lists the setup screen offers.
 */

export interface TutorLanguage {
  /** Stored on saved conversations (target_language / native_language). */
  value: string;
  label: string;
  flag: string;
  /** How the language is written, for the tutor and its transcriber. */
  script: string;
}

export const TUTOR_LANGUAGES: TutorLanguage[] = [
  { value: 'en', label: 'English', flag: '🇬🇧', script: 'the Latin alphabet' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸', script: 'the Latin alphabet' },
  { value: 'fr', label: 'French', flag: '🇫🇷', script: 'the Latin alphabet' },
  { value: 'de', label: 'German', flag: '🇩🇪', script: 'the Latin alphabet' },
  { value: 'it', label: 'Italian', flag: '🇮🇹', script: 'the Latin alphabet' },
  { value: 'pt', label: 'Portuguese', flag: '🇵🇹', script: 'the Latin alphabet' },
  { value: 'pt-br', label: 'Portuguese (Brazil)', flag: '🇧🇷', script: 'the Latin alphabet' },
  { value: 'nl', label: 'Dutch', flag: '🇳🇱', script: 'the Latin alphabet' },
  { value: 'ja', label: 'Japanese', flag: '🇯🇵', script: 'Japanese script (hiragana, katakana and kanji)' },
  { value: 'ko', label: 'Korean', flag: '🇰🇷', script: 'Hangul' },
  { value: 'zh', label: 'Chinese (Mandarin)', flag: '🇨🇳', script: 'simplified Chinese characters' },
  { value: 'ar', label: 'Arabic', flag: '🇸🇦', script: 'Arabic script' },
  { value: 'hi', label: 'Hindi', flag: '🇮🇳', script: 'Devanagari script' },
  { value: 'ur', label: 'Urdu', flag: '🇵🇰', script: 'Urdu script (Perso-Arabic Nastaliq), never Devanagari or Latin letters' },
  { value: 'tr', label: 'Turkish', flag: '🇹🇷', script: 'the Latin alphabet' },
  { value: 'ru', label: 'Russian', flag: '🇷🇺', script: 'Cyrillic script' },
  { value: 'pl', label: 'Polish', flag: '🇵🇱', script: 'the Latin alphabet' },
  { value: 'sv', label: 'Swedish', flag: '🇸🇪', script: 'the Latin alphabet' },
  { value: 'id', label: 'Indonesian', flag: '🇮🇩', script: 'the Latin alphabet' },
  { value: 'vi', label: 'Vietnamese', flag: '🇻🇳', script: 'the Latin alphabet with Vietnamese tone marks' },
];

export const TUTOR_LEVELS = [
  { value: 'beginner', label: 'Beginner', hint: 'Taught almost all in your language' },
  { value: 'intermediate', label: 'Intermediate', hint: 'A mix of both languages' },
  { value: 'advanced', label: 'Advanced', hint: 'Mostly in the new language' },
] as const;

export type TutorLevel = (typeof TUTOR_LEVELS)[number]['value'];

export const findTutorLanguage = (value: string | null | undefined) =>
  TUTOR_LANGUAGES.find((language) => language.value === value);

/** A saved conversation's language code as a readable name, with its flag. */
export function tutorLanguageLabel(value: string | null | undefined) {
  const language = findTutorLanguage(value);
  return language
    ? { label: language.label, flag: language.flag }
    : { label: value ? value.toUpperCase() : 'Unknown', flag: '🌐' };
}
