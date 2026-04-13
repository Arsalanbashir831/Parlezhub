import { NakshatraData, TaraType } from '@/types/astrology';

export const NAKSHATRAS: NakshatraData[] = [
  { name: 'Ashwini', lord: 'Ketu', index: 1 },
  { name: 'Bharani', lord: 'Venus', index: 2 },
  { name: 'Krittika', lord: 'Sun', index: 3 },
  { name: 'Rohini', lord: 'Moon', index: 4 },
  { name: 'Mrigashira', lord: 'Mars', index: 5 },
  { name: 'Ardra', lord: 'Rahu', index: 6 },
  { name: 'Punarvasu', lord: 'Jupiter', index: 7 },
  { name: 'Pushya', lord: 'Saturn', index: 8 },
  { name: 'Ashlesha', lord: 'Mercury', index: 9 },
  { name: 'Magha', lord: 'Ketu', index: 10 },
  { name: 'Purva Phalguni', lord: 'Venus', index: 11 },
  { name: 'Uttara Phalguni', lord: 'Sun', index: 12 },
  { name: 'Hasta', lord: 'Moon', index: 13 },
  { name: 'Chitra', lord: 'Mars', index: 14 },
  { name: 'Swati', lord: 'Rahu', index: 15 },
  { name: 'Vishakha', lord: 'Jupiter', index: 16 },
  { name: 'Anuradha', lord: 'Saturn', index: 17 },
  { name: 'Jyeshtha', lord: 'Mercury', index: 18 },
  { name: 'Moola', lord: 'Ketu', index: 19 },
  { name: 'Purva Ashadha', lord: 'Venus', index: 20 },
  { name: 'Uttara Ashadha', lord: 'Sun', index: 21 },
  { name: 'Shravana', lord: 'Moon', index: 22 },
  { name: 'Dhanishta', lord: 'Mars', index: 23 },
  { name: 'Shatabhisha', lord: 'Rahu', index: 24 },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', index: 25 },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', index: 26 },
  { name: 'Revati', lord: 'Mercury', index: 27 },
];

export const TARA_MAPPING: Record<number, TaraType> = {
  1: TaraType.JANMA,
  2: TaraType.SAMPAT,
  3: TaraType.VIPAT,
  4: TaraType.KSHEMA,
  5: TaraType.PRATYARI,
  6: TaraType.SADHAKA,
  7: TaraType.VADHA,
  8: TaraType.MITRA,
  0: TaraType.ATI_MITRA, // 9 % 9 is 0
};

export const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: 'Ari' },
  { name: 'Taurus', symbol: 'Tau' },
  { name: 'Gemini', symbol: 'Gem' },
  { name: 'Cancer', symbol: 'Can' },
  { name: 'Leo', symbol: 'Leo' },
  { name: 'Virgo', symbol: 'Vir' },
  { name: 'Libra', symbol: 'Lib' },
  { name: 'Scorpio', symbol: 'Sco' },
  { name: 'Sagittarius', symbol: 'Sag' },
  { name: 'Capricorn', symbol: 'Cap' },
  { name: 'Aquarius', symbol: 'Aqu' },
  { name: 'Pisces', symbol: 'Pis' },
];

export const RIGHT_MENU_ITEMS = [
  { id: 'd1-chart', label: 'D1 Chart & Transit', icon: '✨' },
  { id: 'd9-chart', label: 'D9 Navamsa Chart', icon: '👑' },
  { id: 'navatara', label: 'Navatara (Nine Stars)', icon: '⭐' },
  { id: 'birth-profile', label: 'Update Birth Profile', icon: '⚙️' },
  { id: 'share-access', label: 'Share Access', icon: '🤝' },
];

export const LEFT_MENU_ITEMS = [
  { id: 'benefic_planets', label: 'Benefic Planets', icon: '💎' },
  { id: 'malefic_planets', label: 'Malefic Planets', icon: '🔥' },
  { id: 'chart_analysis', label: 'Chart Analysis', icon: '📜' },
  { id: 'planetary_states', label: 'Planetary Avatars & States', icon: '🎭' },
  {
    id: 'astro_energy',
    label: '12-Dimensional Astro Energy',
    icon: '🌀',
  },
  { id: 'rashi_planets', label: 'Meaning of Rashi Rulers', icon: '👑' },
  { id: 'lagna_lord', label: 'Your Lagna Lord Position', icon: '🏛️' },
  { id: 'challenges', label: 'Challenges & Learning', icon: '☯️' },
  { id: 'mental_health', label: 'Mental Health', icon: '🧠' },
  { id: 'marriage', label: 'Marriage Timing', icon: '💍' },
  { id: 'prosperity_sav', label: 'Prosperity & Career (SAV)', icon: '💼' },
  { id: 'medical', label: 'Medical Astrology', icon: '🏥' },
  {
    id: 'btr',
    label: 'Birth Time Rectification',
    icon: '⏳',
  },
  { id: 'parasari', label: 'Parasari Relationships', icon: '👥' },
  { id: 'darakaraka', label: 'Spouse Profile (Jaimini)', icon: '❤️' },
];
