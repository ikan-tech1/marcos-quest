import { Achievements } from '../systems/achievements';
import { Storage } from '../systems/Storage';

export function AchievementsGrid({ compact = false }: { compact?: boolean }) {
  const unlocked = Storage.getUnlockedAchievements();

  return (
    <div className={`achievements-grid${compact ? ' achievements-grid--compact' : ''}`}>
      {Achievements.getAll().map((a) => {
        const isUnlocked = unlocked.includes(a.id);
        const hidden = a.secret && !isUnlocked;
        return (
          <div
            key={a.id}
            className={`achievement-badge${isUnlocked ? ' achievement-badge--unlocked' : ' achievement-badge--locked'}${hidden ? ' achievement-badge--secret' : ''}`}
            title={hidden ? '???' : a.description}
          >
            <span className="achievement-badge-icon">{hidden ? '?' : a.icon}</span>
            <span className="achievement-badge-title">{hidden ? 'Secret' : a.title}</span>
          </div>
        );
      })}
    </div>
  );
}
