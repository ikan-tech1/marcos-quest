import { Missions } from '../systems/missions';

export function MissionBoard({ compact = false }: { compact?: boolean }) {
  const missions = Missions.getActiveMissions();

  return (
    <div className={`mission-board${compact ? ' mission-board--compact' : ''}`}>
      <p className="mission-board-label">ACTIVE MISSIONS</p>
      {missions.map((m) => (
        <div key={m.def.id} className={`mission-card${m.completed ? ' mission-card--done' : ''}`}>
          <div className="mission-card-header">
            <span className="mission-card-title">{m.def.title}</span>
            {m.completed && <span className="mission-card-done">✓</span>}
          </div>
          <p className="mission-card-desc">{m.def.description}</p>
          <div className="mission-progress-bar">
            <div
              className="mission-progress-fill"
              style={{ width: `${Math.min(100, (m.progress / m.def.target) * 100)}%` }}
            />
          </div>
          <span className="mission-progress-text">
            {Math.min(m.progress, m.def.target)} / {m.def.target}
          </span>
        </div>
      ))}
    </div>
  );
}
