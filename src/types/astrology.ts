export enum TaraType {
  JANMA = 'Janma',
  SAMPAT = 'Sampat',
  VIPAT = 'Vipat',
  KSHEMA = 'Kshema',
  PRATYARI = 'Pratyari',
  SADHAKA = 'SADHAKA',
  VADHA = 'Vadha',
  MITRA = 'Mitra',
  ATI_MITRA = 'Ati-Mitra',
}

export interface Planet {
  name: string;
  symbol: string;
  house: number;
  sign: string;
  isBenefic: boolean;
}

export interface NakshatraData {
  name: string;
  lord: string;
  index: number;
}

export interface DashboardState {
  userNakshatraIndex: number; // 1-27
  currentMoonNakshatraIndex: number;
  tithi: string;
  tara: TaraType;
  username: string;
}

// === NEW ASTROLOGY API TYPES ===
export interface BirthProfile {
  id: number;
  user_name: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  birth_minute: number;
  city: string;
  country_code: string;
  timezone_str: string;
  created_at: string;
  updated_at: string;
}

export interface TransitPlanet {
  planet: string;
  longitude: number;
  sign_index: number;
  sign: string;
  nakshatra: string;
  nakshatra_number: number;
  house_from_moon: number;
  nature: string;
  effects: string[];
  speed_per_day: number;
  interpretation: string;
  detailed_effects?: string[];
}

export interface TransitSummary {
  favorable_transits: number;
  unfavorable_transits: number;
  mixed_transits: number;
  transit_score: number;
  overall_quality: string;
  overall_summary: string;
}

export interface TransitResponse {
  transit_date: string;
  natal_moon: {
    sign: string;
    sign_index: number;
    nakshatra_number: number;
  };
  transits: TransitPlanet[];
  summary: TransitSummary;
  ayanamsa: string;
}

export interface ChartPlanet {
  planet: string;
  sign: string;
  degree: number;
  lord: string;
}

export interface GrahaDetail {
  graha: string;
  longitude_rashi: string;
  longitude_degree: number;
  current_bhava: number;
  rules_bhavas: number[];
  nakshatra: string;
  nakshatra_pada: number;
  nakshatra_lord: string;
  nakshatra_sublord: string;
}

export interface BhavaDetail {
  bhava: number;
  residents: string[];
  owner: string;
  rashi: string;
}

export interface DivisionalChart {
  name: string;
  purpose: string;
  positions: ChartPlanet[];
  graha_details: GrahaDetail[];
  bhava_details: BhavaDetail[];
}

export interface PlanetPosition {
  planet: string;
  sidereal_longitude: number;
  rashi: string;
  rashi_lord: string;
  degree_in_rashi: number;
  nakshatra: string;
  nakshatra_number: number;
  nakshatra_pada: number;
  nakshatra_lord: string;
  nakshatra_sublord: string;
  degree_in_nakshatra: number;
  degree_in_pada: number;
  pada_percentage: number;
  house: number;
  house_lord: string;
  dignity: string;
  is_retrograde: boolean;
  speed: number;
  is_combust: boolean;
  combustion_orb: number | null;
  is_vargottama: boolean;
  navamsa_sign: string;
}

export interface NatalChartResponse {
  birth_profile: BirthProfile;
  planets: PlanetPosition[];
  ascendant: {
    sidereal_longitude: number;
    rashi: string;
    nakshatra: string;
    nakshatra_pada: number;
    degree_in_nakshatra: number;
    degree_in_pada: number;
  };
  moon_sign: string;
  sun_sign: string;
  nakshatra: string;
  ayanamsa: string;
  ayanamsa_value: number;
  calculation_info: Record<string, unknown>;
  d1_chart: DivisionalChart;
  d9_chart: DivisionalChart;
  vargottama_planets: string[];
}
export interface AstrologicalInsight {
  category: string;
  insight_text: string;
}

export interface AstrologyConsultant {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_picture: string | null;
  bio: string;
  about: string;
  qualification: string;
  experience_years: number;
}

export interface AstrologyAccess {
  id: number;
  consultant: {
    id: string;
    email: string;
    full_name: string;
    profile_picture: string | null;
  };
  granted_at: string;
}

export interface SharedStudentAccess {
  id: number;
  student: {
    id: string;
    full_name: string;
    profile_picture: string | null;
  };
  has_birth_profile: boolean;
  granted_at: string;
}

export interface TaraBalaData {
  name: string;
  count: number;
  effect: string;
}

export interface NakshatraPredictionResponse {
  subject_name: string;
  prediction_date: string;
  current_moon: {
    nakshatra: string;
    nakshatra_number: number;
    nakshatra_lord: string;
    nakshatra_deity: string;
    pada: number;
    sign: string;
    longitude: number;
  };
  natal_moon: {
    nakshatra: string;
    nakshatra_number: number;
    nakshatra_lord: string;
  };
  predictions: {
    general: string;
    career: string;
    relationships: string;
    health: string;
    finance: string;
    spiritual: string;
  };
  guidance: {
    favorable_activities: string[];
    avoid_activities: string[];
    lucky_colors: string[];
    lucky_numbers: number[];
  };
  tarabala: TaraBalaData;
  overall_score: number;
  timing: {
    hours_until_nakshatra_change: number;
    nakshatra_duration_remaining: string;
  };
  ayanamsa: string;
}
