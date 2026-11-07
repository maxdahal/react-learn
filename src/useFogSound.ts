import { useCallback, useEffect, useRef } from "react";
export type FogSound = "good" | "perfect" | "miss" | "escape";
export default function useFogSound(enabled: boolean) {
  const context = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!enabled) void context.current?.suspend().catch(() => {});
  }, [enabled]);
  useEffect(
    () => () => {
      void context.current?.close().catch(() => {});
    },
    [],
  );
  return useCallback(
    (kind: FogSound) => {
      if (!enabled) return;
      const Constructor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Constructor) return;
      try {
        const audio = context.current ?? new Constructor();
        context.current = audio;
        void audio.resume().catch(() => {});
        const time = audio.currentTime;
        const notes =
          kind === "perfect"
            ? [660, 990, 1320]
            : kind === "escape"
              ? [330, 440, 660, 880]
              : kind === "miss"
                ? [150]
                : [440, 660];
        notes.forEach((frequency, i) => {
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, time + i * 0.09);
          gain.gain.linearRampToValueAtTime(0.025, time + i * 0.09 + 0.01);
          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            time + i * 0.09 + 0.16,
          );
          oscillator.connect(gain);
          gain.connect(audio.destination);
          oscillator.start(time + i * 0.09);
          oscillator.stop(time + i * 0.09 + 0.18);
        });
      } catch {
        /* Audio is optional; repair progress still works. */
      }
    },
    [enabled],
  );
}
