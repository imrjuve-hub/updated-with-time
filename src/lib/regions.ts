export type Platform =
  | 'BR1' | 'EUN1' | 'EUW1' | 'JP1' | 'KR' | 'LA1' | 'LA2' | 'NA1'
  | 'OC1' | 'TR1' | 'RU' | 'PH2' | 'SG2' | 'TH2' | 'TW2' | 'VN2';

export type Regional = 'americas' | 'europe' | 'asia' | 'sea';

export const REGIONAL_FROM_PLATFORM: Record<Platform, Regional> = {
  BR1: 'americas',
  LA1: 'americas',
  LA2: 'americas',
  NA1: 'americas',
  EUW1: 'europe',
  EUN1: 'europe',
  TR1: 'europe',
  RU: 'europe',
  JP1: 'asia',
  KR: 'asia',
  // SEA shards and OCE route to SEA for match v5
  OC1: 'sea',
  PH2: 'sea',
  SG2: 'sea',
  TH2: 'sea',
  TW2: 'sea',
  VN2: 'sea',
};

export function normalizePlatform(v: string): Platform {
  const up = v.trim().toUpperCase();
  const known = ['BR1','EUN1','EUW1','JP1','KR','LA1','LA2','NA1','OC1','TR1','RU','PH2','SG2','TH2','TW2','VN2'] as const;
  if ((known as readonly string[]).includes(up)) return up as Platform;
  throw new Error(`Unknown platform ${v}`);
}
