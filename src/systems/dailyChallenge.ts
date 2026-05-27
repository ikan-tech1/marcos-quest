import { Storage } from './Storage';

export type DailyModifier =
  | 'low_gravity'
  | 'double_enemies'
  | 'fog'
  | 'speed_boost'
  | 'coin_frenzy'
  | 'ice_floor';

export interface DailyChallenge {
  dateKey: string;
  modifier: DailyModifier;
  label: string;
  description: string;
  levelIndex: number;
  rewardScore: number;
}

const MODIFIERS: { id: DailyModifier; label: string; description: string }[] = [
  { id: 'low_gravity', label: 'Low Gravity Tuesday', description: 'Jump higher — gravity reduced 35%' },
  { id: 'double_enemies', label: 'Double Trouble', description: 'Enemy spawns are doubled' },
  { id: 'fog', label: 'Foggy Kingdom', description: 'Limited visibility — explore carefully' },
  { id: 'speed_boost', label: 'Turbo Rush', description: 'Move 25% faster' },
  { id: 'coin_frenzy', label: 'Coin Frenzy', description: 'Triple coin spawns' },
  { id: 'ice_floor', label: 'Icy Slopes', description: 'Reduced friction — slide further' },
];

function dateKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getTodayChallenge(): DailyChallenge {
  const key = dateKey();
  const seed = hashSeed(key);
  const mod = MODIFIERS[seed % MODIFIERS.length];
  const levelIndex = seed % 5;
  return {
    dateKey: key,
    modifier: mod.id,
    label: mod.label,
    description: mod.description,
    levelIndex,
    rewardScore: 5000 + (seed % 3000),
  };
}

export function isDailyCompleted(): boolean {
  return Storage.getDailyCompletionDate() === dateKey();
}

export function markDailyCompleted(): { streak: number; reward: number } {
  const today = dateKey();
  const last = Storage.getDailyCompletionDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);

  let streak = Storage.getDailyStreak();
  if (last === yesterdayKey) {
    streak += 1;
  } else if (last !== today) {
    streak = 1;
  }
  Storage.setDailyCompletion(today, streak);
  const challenge = getTodayChallenge();
  return { streak, reward: challenge.rewardScore };
}

export function getDailyStreak(): number {
  const last = Storage.getDailyCompletionDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (last === dateKey() || last === dateKey(yesterday)) {
    return Storage.getDailyStreak();
  }
  return 0;
}

export function getModifierGravityMult(mod: DailyModifier): number {
  return mod === 'low_gravity' ? 0.65 : 1;
}

export function getModifierSpeedMult(mod: DailyModifier): number {
  return mod === 'speed_boost' ? 1.25 : 1;
}

export function getModifierFrictionMult(mod: DailyModifier): number {
  return mod === 'ice_floor' ? 0.4 : 1;
}
