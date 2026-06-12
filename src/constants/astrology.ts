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

export const ASTRO_CHART_TYPES = [
  { id: 'd1', label: 'D1 Natal Chart', title: 'D1 Natal Chart' },
  { id: 'd2', label: 'D2 Hora Chart', title: 'D2 Hora Chart' },
  { id: 'd3', label: 'D3 Drekkana Chart', title: 'D3 Drekkana Chart' },
  { id: 'd4', label: 'D4 Chaturthamsa Chart', title: 'D4 Chaturthamsa Chart' },
  { id: 'd7', label: 'D7 Saptamsha Chart', title: 'D7 Saptamsha Chart' },
  { id: 'd9', label: 'D9 Navamsa Chart', title: 'D9 Navamsa Chart' },
  { id: 'd10', label: 'D10 Dashamsha Chart', title: 'D10 Dashamsha Chart' },
  { id: 'd12', label: 'D12 Dwadashamsha Chart', title: 'D12 Dwadashamsha Chart' },
  { id: 'd16', label: 'D16 Shodashamsha Chart', title: 'D16 Shodashamsha Chart' },
  { id: 'd20', label: 'D20 Vimshamsha Chart', title: 'D20 Vimshamsha Chart' },
  { id: 'd24', label: 'D24 Chaturvimshamsha Chart', title: 'D24 Chaturvimshamsha Chart' },
  { id: 'd27', label: 'D27 Saptavimshamsha Chart', title: 'D27 Saptavimshamsha Chart' },
  { id: 'd30', label: 'D30 Trimshamsha Chart', title: 'D30 Trimshamsha Chart' },
  { id: 'd40', label: 'D40 Khavedamsha Chart', title: 'D40 Khavedamsha Chart' },
  { id: 'd45', label: 'D45 Akshavedamsha Chart', title: 'D45 Akshavedamsha Chart' },
  { id: 'd60', label: 'D60 Shashtiamsha Chart', title: 'D60 Shashtiamsha Chart' },
];

export const RIGHT_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🪐' },
  { id: 'dasha', label: 'Dasha Timeline', icon: '⏳' },
  { id: 'navatara', label: 'Navatara (Nine Stars)', icon: '⭐' },
  { id: 'festival-calendar', label: 'Festival Calendar', icon: '📅' },
  { id: 'reports', label: 'My Reports', icon: '📋' },
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
  { id: 'btr', label: 'Birth Time Rectification', icon: '⏳' },
  { id: 'parasari', label: 'Parasari Relationships', icon: '👥' },
  { id: 'darakaraka', label: 'Spouse Profile (Jaimini)', icon: '❤️' },
  { id: 'foreign_travel', label: 'Foreign Travel', icon: '✈️' },
];

export const PLANET_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

export const PLANET_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const PLANET_META: Record<string, { symbol: string; color: string; border: string; glow: string }> = {
  Sun: { symbol: '☉', color: '#f59e0b', border: 'border-amber-500/60', glow: '0 0 14px rgba(245,158,11,0.4)' },
  Moon: { symbol: '☽', color: '#38bdf8', border: 'border-sky-300/60', glow: '0 0 14px rgba(56,189,248,0.3)' },
  Mars: { symbol: '♂', color: '#ef4444', border: 'border-red-500/60', glow: '0 0 14px rgba(239,68,68,0.4)' },
  Mercury: { symbol: '☿', color: '#10b981', border: 'border-emerald-500/60', glow: '0 0 14px rgba(16,185,129,0.4)' },
  Jupiter: { symbol: '♃', color: '#eab308', border: 'border-yellow-500/60', glow: '0 0 14px rgba(234,179,8,0.4)' },
  Venus: { symbol: '♀', color: '#ec4899', border: 'border-pink-500/60', glow: '0 0 14px rgba(236,72,153,0.4)' },
  Saturn: { symbol: '♄', color: '#a78bfa', border: 'border-violet-400/60', glow: '0 0 14px rgba(167,139,250,0.4)' },
  Rahu: { symbol: '☊', color: '#8b5cf6', border: 'border-purple-500/60', glow: '0 0 14px rgba(139,92,246,0.5)' },
  Ketu: { symbol: '☋', color: '#f97316', border: 'border-orange-500/60', glow: '0 0 14px rgba(249,115,22,0.4)' },
};

export const DEFAULT_PLANET_META = {
  symbol: '★',
  color: '#f97316',
  border: 'border-primary-500/60',
  glow: '0 0 14px rgba(249,115,22,0.4)',
};

export const PLANET_INSIGHTS: Record<string, { about: string; favorable: string[]; challenges: string[] }> = {
  Sun: {
    about: "The Sun represents the soul, leadership, authority, clarity, and vital power. This period shines a bright light on your career, ambition, self-confidence, and public standing, urging you to stand in your true power.",
    favorable: [
      "Career advancement & promotions",
      "Leadership roles & public recognition",
      "Vital health, energy & clarity",
      "Government or administrative success"
    ],
    challenges: [
      "Ego clashes & interpersonal friction",
      "Overbearing attitude or impatience",
      "High professional expectations & stress"
    ]
  },
  Moon: {
    about: "The Moon governs the mind, emotions, receptivity, peace, and maternal care. This is a deeply nurturing, introspective period focused on emotional intelligence, home life, and finding your inner sanctuary.",
    favorable: [
      "Intuition & mental peace",
      "Nurturing family relationships",
      "Artistic & emotional depth",
      "Home improvements & relocation"
    ],
    challenges: [
      "Mood fluctuations & emotional sensitivity",
      "Overly defensive or reactive habits",
      "Anxiety & mental restlessness"
    ]
  },
  Mars: {
    about: "Mars represents energy, courage, action, passion, and determination. This dynamic period fills you with immense drive, physical strength, and a pioneering spirit to boldly overcome life obstacles.",
    favorable: [
      "Bold actions & starting new initiatives",
      "Physical energy & athletic achievements",
      "Overcoming competitors & obstacles",
      "Real estate or land acquisitions"
    ],
    challenges: [
      "Anger, impatience & quick temper",
      "Physical burnout or minor accidents",
      "Impulsive or aggressive decisions"
    ]
  },
  Mercury: {
    about: "Mercury represents communication, intellect, business, analytical skills, and learning. This highly active period enhances intellectual skills, business growth, networking, and creative expression.",
    favorable: [
      "Effective communication & writing",
      "Business expansion & trade ventures",
      "Acquiring new skills & higher research",
      "Expanding social & professional networks"
    ],
    challenges: [
      "Nervous exhaustion or mental burnout",
      "Overthinking & analytical paralysis",
      "Scattered focus or speaking out of turn"
    ]
  },
  Jupiter: {
    about: "Jupiter represents wisdom, expansion, knowledge, good fortune, and benevolence. This is one of the most auspicious periods, bringing learning, spiritual wisdom, wealth, and general prosperity.",
    favorable: [
      "Higher education, wisdom & coaching",
      "Financial growth & wealth accumulation",
      "Spiritual devotion & philosophical study",
      "Generosity, mentoring & community roles"
    ],
    challenges: [
      "Over-optimism leading to miscalculations",
      "Tendency for metabolic sluggishness",
      "Dogmatic or self-righteous beliefs"
    ]
  },
  Venus: {
    about: "Venus governs harmony, wealth, artistic pursuits, relationships, and comforts. This major period brings opportunities for creativity, love, prosperity, and enjoying the finer aspects of life.",
    favorable: [
      "Deepening relationships & marriage",
      "Creative & artistic breakthroughs",
      "Financial gains & beautiful assets",
      "Luxuries, travel & overall comforts"
    ],
    challenges: [
      "Over-indulgence, laziness or luxury traps",
      "Sensual attachments or relationship drama",
      "Superficial or short-lived financial whims"
    ]
  },
  Saturn: {
    about: "Saturn governs discipline, structure, hard work, responsibility, and karmic lessons. This period demands patience, maturity, and focus, building solid foundations for long-term stability through dedication.",
    favorable: [
      "Discipline, structure & long-term plans",
      "Career stability built through consistency",
      "Emotional maturity & self-mastery",
      "Organizational efficiency & patience"
    ],
    challenges: [
      "Delays, setbacks & testing periods",
      "Feelings of heaviness or isolation",
      "Physical fatigue or joint stiffness"
    ]
  },
  Rahu: {
    about: "Rahu brings growth through unconventional paths, material desires, foreign connections, and sudden changes. It is a time of ambition, breakthroughs, and karmic realignments.",
    favorable: [
      "Foreign travel, study or settlement",
      "Technology, research & innovation success",
      "Breaking free from limiting old patterns",
      "Sudden gains, political or mass influence"
    ],
    challenges: [
      "Confusion, illusion & mental restlessness",
      "Unexpected ups & downs",
      "Unorthodox or risky decisions"
    ]
  },
  Ketu: {
    about: "Ketu represents spiritual detachment, sudden events, deep intuition, and liberation. It is a time for inner reflection, letting go of material attachments, and discovering deeper truth.",
    favorable: [
      "Deep spiritual growth & meditation",
      "Metaphysical research & occult studies",
      "Intuitive breakthroughs & self-inquiry",
      "Breaking out of cyclical habits"
    ],
    challenges: [
      "Feelings of isolation or disconnection",
      "Confusion, self-doubt or lack of goals",
      "Sudden unexpected changes in daily life"
    ]
  }
};

export const DEFAULT_PLANET_INSIGHT = {
  about: "This planetary rulership period governs a key phase of your cosmic development, offering unique growth vectors, lessons, and blessings.",
  favorable: ["Self-awareness and personal alignment", "Mindfulness and daily meditation", "Strategic adjustments"],
  challenges: ["Adapting to transition phases", "Patience with timing parameters"]
};

