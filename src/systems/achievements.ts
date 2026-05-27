import { Storage } from './Storage';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  secret?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-stomp', title: 'First Stomp', description: 'Stomp your first enemy', icon: '👟' },
  { id: 'coins-100', title: 'Centurion', description: 'Collect 100 coins total', icon: '🪙' },
  { id: 'combo-5', title: 'Combo Starter', description: 'Reach a 5× stomp combo', icon: '🔥' },
  { id: 'world-clear', title: 'World Traveler', description: 'Clear your first world', icon: '🌍' },
  { id: 'no-damage-level', title: 'Untouchable', description: 'Clear a level without damage', icon: '🛡' },
  { id: 'speedrun-ghost', title: 'Ghost Buster', description: 'Beat your speedrun ghost time', icon: '👻' },
  { id: 'daily-7', title: 'Week Warrior', description: '7-day daily challenge streak', icon: '📅' },
  { id: 'all-missions', title: 'Quest Master', description: 'Complete all missions', icon: '⭐' },
  { id: 'boss-stomp', title: 'Boss Slayer', description: 'Defeat Iron Guard with stomps only', icon: '👹' },
  { id: 'secret-room', title: 'Hidden Explorer', description: 'Find the secret room in World 2-1', icon: '🚪', secret: true },
  { id: 'nova-unlock', title: 'Nova Rising', description: 'Unlock the secret hero Nova', icon: '✨', secret: true },
  { id: 'cheat-master', title: 'Code Breaker', description: 'Discover a cheat code', icon: '🎮', secret: true },
];

class AchievementTrackerClass {
  unlock(id: string): boolean {
    if (Storage.isAchievementUnlocked(id)) return false;
    Storage.unlockAchievement(id);
    return true;
  }

  isUnlocked(id: string): boolean {
    return Storage.isAchievementUnlocked(id);
  }

  getUnlockedCount(): number {
    return Storage.getUnlockedAchievements().length;
  }

  getAll(): Achievement[] {
    return ACHIEVEMENTS;
  }

  getVisible(): Achievement[] {
    return ACHIEVEMENTS.filter((a) => !a.secret || this.isUnlocked(a.id));
  }
}

export const Achievements = new AchievementTrackerClass();
