import { useCallback, useEffect, useState, type RefObject } from 'react';

function getFullscreenElement(): Element | null {
  return (
    document.fullscreenElement ??
    (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ??
    null
  );
}

export function useFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(getFullscreenElement() === targetRef.current);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, [targetRef]);

  const enter = useCallback(async () => {
    const el = targetRef.current;
    if (!el || getFullscreenElement()) return;
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else {
        const webkit = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
        await webkit.webkitRequestFullscreen?.();
      }
    } catch {
      /* user gesture required or unsupported */
    }
  }, [targetRef]);

  const exit = useCallback(async () => {
    if (!getFullscreenElement()) return;
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else {
        const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
        await doc.webkitExitFullscreen?.();
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(async () => {
    if (getFullscreenElement() === targetRef.current) {
      await exit();
    } else {
      await enter();
    }
  }, [targetRef, enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
