import { useEffect, useState } from 'react';
import { GameBridge, type AchievementUnlockPayload } from '../systems/GameBridge';

export function AchievementToast() {
  const [toast, setToast] = useState<AchievementUnlockPayload | null>(null);

  useEffect(() => {
    const unsub = GameBridge.on('achievement-unlock', (data) => {
      const payload = data as AchievementUnlockPayload;
      setToast(payload);
      window.setTimeout(() => setToast(null), 3200);
    });
    return unsub;
  }, []);

  if (!toast) return null;

  return (
    <div className="achievement-toast screen-enter" role="status">
      <span className="achievement-toast-icon">{toast.icon}</span>
      <div className="achievement-toast-body">
        <span className="achievement-toast-label">Achievement Unlocked</span>
        <span className="achievement-toast-title">{toast.title}</span>
      </div>
    </div>
  );
}

export function MissionToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = GameBridge.on('mission-complete', (data) => {
      const { title, rewardScore } = data as { title: string; rewardScore: number };
      setMsg(`${title} complete! +${rewardScore}`);
      window.setTimeout(() => setMsg(null), 3200);
    });
    return unsub;
  }, []);

  if (!msg) return null;

  return (
    <div className="mission-toast screen-enter" role="status">
      <span className="mission-toast-icon">🎯</span>
      <span className="mission-toast-text">{msg}</span>
    </div>
  );
}
