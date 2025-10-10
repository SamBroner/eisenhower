import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface FocusTimerSnapshot {
  remainingSeconds: number;
  isManuallyPaused: boolean;
  taskId?: string;
}

interface FocusTimerProps {
  isActive: boolean;
  taskId?: string;
  durationSeconds: number;
  initialState?: FocusTimerSnapshot;
  onStateSnapshot?: (snapshot: FocusTimerSnapshot) => void;
  onComplete?: () => void;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const FocusTimer: React.FC<FocusTimerProps> = ({
  isActive,
  taskId,
  durationSeconds,
  initialState,
  onStateSnapshot,
  onComplete,
}) => {
  const initialRemaining = initialState?.remainingSeconds ?? durationSeconds;
  const initialPaused = initialState?.isManuallyPaused ?? false;

  const [remainingSeconds, setRemainingSeconds] = useState(initialRemaining);
  const [isManuallyPaused, setIsManuallyPaused] = useState(initialPaused);
  const [isRunning, setIsRunning] = useState(isActive && !initialPaused && initialRemaining > 0);

  const intervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const latestStateRef = useRef<FocusTimerSnapshot>({
    remainingSeconds: initialRemaining,
    isManuallyPaused: initialPaused,
    taskId,
  });

  useEffect(() => {
    const nextRemaining = initialState?.remainingSeconds ?? durationSeconds;
    const nextPaused = initialState?.isManuallyPaused ?? false;

    setRemainingSeconds(nextRemaining);
    setIsManuallyPaused(nextPaused);
    setIsRunning(isActive && !nextPaused && nextRemaining > 0);
  }, [taskId, durationSeconds, initialState, isActive]);

  useEffect(() => {
    if (isActive) {
      if (!isManuallyPaused && remainingSeconds > 0) {
        setIsRunning(true);
      }
    } else {
      setIsRunning(false);
    }
  }, [isActive, isManuallyPaused, remainingSeconds]);

  const handleStartPause = () => {
    if (!isActive) return;

    setIsRunning(prev => {
      const next = !prev;
      setIsManuallyPaused(!next);
      return next;
    });
  };

  const handleReset = () => {
    const resetSeconds = durationSeconds;
    setRemainingSeconds(resetSeconds);
    setIsManuallyPaused(false);
    if (isActive && resetSeconds > 0) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (remainingSeconds % 60)
    .toString()
    .padStart(2, '0');

  const progress =
    durationSeconds > 0
      ? Math.min(1, Math.max(0, 1 - remainingSeconds / durationSeconds))
      : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const getAudioContext = useCallback(async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume().catch(() => undefined);
    }
    return audioCtxRef.current;
  }, []);

  const playCompletionTone = useCallback(() => {
    try {
      getAudioContext().then(ctx => {
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        const now = ctx.currentTime;
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.linearRampToValueAtTime(660, now + 0.6);
        oscillator.frequency.linearRampToValueAtTime(520, now + 1.4);
        oscillator.frequency.linearRampToValueAtTime(440, now + 1.8);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.4, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.9);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(now + 2.05);
      });
    } catch (error) {
      console.error('Failed to play completion tone', error);
    }
  }, [getAudioContext]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          playCompletionTone();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, playCompletionTone, onComplete]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    latestStateRef.current = {
      remainingSeconds,
      isManuallyPaused,
      taskId,
    };
  }, [remainingSeconds, isManuallyPaused, taskId]);

  useEffect(() => {
    return () => {
      if (onStateSnapshot) {
        onStateSnapshot(latestStateRef.current);
      }
    };
  }, [onStateSnapshot]);

  return (
    <div className="focus-timer">
      <div className="focus-timer__ring">
        <svg viewBox="0 0 120 120">
          <circle className="focus-timer__ring-bg" cx="60" cy="60" r={RADIUS} />
          <circle
            className="focus-timer__ring-progress"
            cx="60"
            cy="60"
            r={RADIUS}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="focus-timer__time">
          {minutes}:{seconds}
        </div>
      </div>
      <div className="focus-timer__controls">
        <button
          type="button"
          className="focus-timer__button"
          onClick={handleStartPause}
          disabled={!isActive}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          className="focus-timer__button focus-timer__button--ghost"
          onClick={handleReset}
          disabled={!isActive}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default FocusTimer;
