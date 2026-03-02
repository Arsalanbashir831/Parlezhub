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
