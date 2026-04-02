import { useEffect, useRef } from 'react';
import { usePomodoroStore } from '@/store/pomodoro-store';
import { useAuth } from '@/lib/auth-context';
import confetti from 'canvas-confetti';

export function usePomodoro() {
  const store = usePomodoroStore();
  const { user } = useAuth();
  
  // Custom setInterval implementation to avoid stale closures
  const savedCallback = useRef<() => void>(undefined);

  useEffect(() => {
    savedCallback.current = () => {
      if (store.isRunning && store.secondsRemaining > 0) {
        store.tick();
      }
    };
  }, [store]);

  useEffect(() => {
    const tick = () => savedCallback.current?.();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Global Keyboard Shortcut: Ctrl/Cmd + P to toggle visibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        store.toggleVisibility();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store.toggleVisibility]);

  return store;
}

export function playAlertSound(style: string, vol: number, enabled: boolean) {
  if (!enabled || style === 'none' || typeof window === 'undefined') return;
  
  const soundUrls: Record<string, string> = {
    bell: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3',
    digital: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3',
    soft: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b8f8e02d.mp3'
  };

  const audio = new Audio(soundUrls[style]);
  audio.volume = Math.max(0, Math.min(1, vol));
  audio.play().catch(e => console.error("Audio play failed:", e));
}

export function triggerFocusConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { x: 0.9, y: 0.9 },
    colors: ['#6366f1', '#818cf8', '#c7d2fe']
  });
}
