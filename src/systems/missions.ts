import { Storage } from './Storage';

export type MissionKind =
  | 'stomp_no_damage'
  | 'collect_coins'
  | 'slow_clear'
  | 'boss_no_fire'
  | 'combo_chain'
  | 'dash_count';

export interface MissionDefinition {
  id: string;
  kind: MissionKind;
  title: string;
  description: string;
  target: number;
  rewardScore: number;
  rewardCosmetic?: string;
  unlockSecret?: boolean;
}

export interface ActiveMission {
  def: MissionDefinition;
  progress: number;
  completed: boolean;
}

export const MISSION_POOL: MissionDefinition[] = [
  {
    id: 'stomp-5',
    kind: 'stomp_no_damage',
    title: 'Stomp Squad',
    description: 'Stomp 5 enemies without taking damage',
    target: 5,
    rewardScore: 2000,
  },
  {
    id: 'coins-20',
    kind: 'collect_coins',
    title: 'Coin Collector',
    description: 'Collect 20 coins in one level',
    target: 20,
    rewardScore: 1500,
  },
  {
    id: 'slow-clear',
    kind: 'slow_clear',
    title: 'Explorer',
    description: 'Clear a level with 200+ seconds on timer',
    target: 200,
    rewardScore: 2500,
  },
  {
    id: 'boss-no-fire',
    kind: 'boss_no_fire',
    title: 'Pure Stomper',
    description: 'Defeat a boss without fire power',
    target: 1,
    rewardScore: 3000,
    rewardCosmetic: 'golden-crown',
  },
  {
    id: 'combo-8',
    kind: 'combo_chain',
    title: 'Combo King',
    description: 'Reach an 8× stomp combo in one level',
    target: 8,
    rewardScore: 1800,
  },
  {
    id: 'dash-10',
    kind: 'dash_count',
    title: 'Speed Demon',
    description: 'Dash 10 times in one level',
    target: 10,
    rewardScore: 1200,
  },
];

class MissionManagerClass {
  private active: ActiveMission[] = [];
  private levelStompsNoDamage = 0;
  private levelCoins = 0;
  private levelDashes = 0;
  private levelDamageTaken = false;
  private levelUsedFire = false;
  private levelHadBoss = false;
  private levelMaxCombo = 0;

  constructor() {
    this.loadActive();
  }

  private loadActive(): void {
    const stored = Storage.getActiveMissions();
    if (stored.length >= 3) {
      this.active = stored
        .map((id) => {
          const def = MISSION_POOL.find((m) => m.id === id);
          return def ? { def, progress: 0, completed: false } : null;
        })
        .filter((m): m is ActiveMission => m !== null)
        .slice(0, 3);
    }
    if (this.active.length < 3) {
      this.refreshMissions();
    }
  }

  refreshMissions(): void {
    const completed = Storage.getCompletedMissionIds();
    const available = MISSION_POOL.filter((m) => !completed.includes(m.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    this.active = shuffled.slice(0, 3).map((def) => ({ def, progress: 0, completed: false }));
    Storage.setActiveMissions(this.active.map((m) => m.def.id));
  }

  resetLevelTracking(): void {
    this.levelStompsNoDamage = 0;
    this.levelCoins = 0;
    this.levelDashes = 0;
    this.levelDamageTaken = false;
    this.levelUsedFire = false;
    this.levelHadBoss = false;
    this.levelMaxCombo = 0;
    this.active.forEach((m) => {
      m.progress = 0;
      m.completed = false;
    });
  }

  onStomp(): void {
    if (!this.levelDamageTaken) {
      this.levelStompsNoDamage += 1;
    }
    this.updateProgress('stomp_no_damage', this.levelStompsNoDamage);
  }

  onDamage(): void {
    this.levelDamageTaken = true;
    this.updateProgress('stomp_no_damage', 0);
    this.active.filter((m) => m.def.kind === 'stomp_no_damage').forEach((m) => {
      m.progress = 0;
    });
  }

  onCoinCollected(): void {
    this.levelCoins += 1;
    this.updateProgress('collect_coins', this.levelCoins);
  }

  onDash(): void {
    this.levelDashes += 1;
    this.updateProgress('dash_count', this.levelDashes);
  }

  onFireUsed(): void {
    this.levelUsedFire = true;
  }

  onBossEncounter(): void {
    this.levelHadBoss = true;
  }

  onComboUpdate(combo: number): void {
    this.levelMaxCombo = Math.max(this.levelMaxCombo, combo);
    this.updateProgress('combo_chain', this.levelMaxCombo);
  }

  onLevelClear(timeLeft: number): void {
    this.updateProgress('slow_clear', Math.floor(timeLeft));
    if (this.levelHadBoss && !this.levelUsedFire) {
      this.updateProgress('boss_no_fire', 1);
    }
  }

  private updateProgress(kind: MissionKind, value: number): void {
    for (const mission of this.active) {
      if (mission.completed || mission.def.kind !== kind) continue;
      mission.progress = value;
      if (value >= mission.def.target) {
        this.completeMission(mission);
      }
    }
  }

  private completeMission(mission: ActiveMission): void {
    if (mission.completed) return;
    mission.completed = true;
    Storage.markMissionCompleted(mission.def.id);
    if (mission.def.rewardCosmetic) {
      Storage.unlockCosmetic(mission.def.rewardCosmetic);
    }
    if (mission.def.unlockSecret) {
      Storage.markSecretUnlocked();
    }
  }

  getActiveMissions(): ActiveMission[] {
    return this.active;
  }

  getCompletedCount(): number {
    return Storage.getCompletedMissionIds().length;
  }

  allMissionsComplete(): boolean {
    return Storage.getCompletedMissionIds().length >= MISSION_POOL.length;
  }

  consumeCompleted(): ActiveMission[] {
    const done = this.active.filter((m) => m.completed);
    if (done.length > 0) {
      this.refreshMissions();
    }
    return done;
  }
}

export const Missions = new MissionManagerClass();
