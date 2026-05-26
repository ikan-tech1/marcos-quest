export interface CharacterStats {
  speedMult: number;
  jumpMult: number;
  dashCooldownMult: number;
  /** Hitbox scale when powered up (big / blaze). */
  poweredHitboxMult: number;
  /** Hitbox scale when small. */
  smallHitboxMult: number;
}

export interface CharacterDefinition {
  id: string;
  name: string;
  tagline: string;
  trait: string;
  accentColor: string;
  stats: CharacterStats;
}

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'eashan',
    name: 'Eashan',
    tagline: 'Kingdom Hero',
    trait: 'Balanced speed & jump',
    accentColor: '#e74c3c',
    stats: {
      speedMult: 1,
      jumpMult: 1,
      dashCooldownMult: 1,
      poweredHitboxMult: 1,
      smallHitboxMult: 1,
    },
  },
  {
    id: 'luna',
    name: 'Luna',
    tagline: 'Neon Sprinter',
    trait: 'Fast run · lower jump',
    accentColor: '#e056fd',
    stats: {
      speedMult: 1.12,
      jumpMult: 0.92,
      dashCooldownMult: 1,
      poweredHitboxMult: 1,
      smallHitboxMult: 1,
    },
  },
  {
    id: 'rex',
    name: 'Rex',
    tagline: 'Iron Guardian',
    trait: 'Slow · high jump · big power',
    accentColor: '#27ae60',
    stats: {
      speedMult: 0.88,
      jumpMult: 1.1,
      dashCooldownMult: 1,
      poweredHitboxMult: 1.15,
      smallHitboxMult: 1,
    },
  },
  {
    id: 'zap',
    name: 'Zap',
    tagline: 'Static Striker',
    trait: 'Quick dash · slim hitbox',
    accentColor: '#f1c40f',
    stats: {
      speedMult: 1,
      jumpMult: 1,
      dashCooldownMult: 0.7,
      poweredHitboxMult: 0.95,
      smallHitboxMult: 0.88,
    },
  },
];

export const DEFAULT_CHARACTER_ID = 'eashan';

export function getCharacterById(id: string): CharacterDefinition {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}

export function getCharacterTextureKey(
  characterId: string,
  state: 'small' | 'big' | 'blaze',
  running: boolean,
  runFrame: number,
): string {
  const frame = Math.min(2, Math.max(0, runFrame));
  const runSuffix = running ? `-run${frame + 1}` : '';
  if (state === 'small') return `${characterId}-small${runSuffix}`;
  if (state === 'blaze') return `${characterId}-blaze${runSuffix}`;
  return `${characterId}-big${runSuffix}`;
}
