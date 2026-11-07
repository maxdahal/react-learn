import { useCallback, useEffect, useRef } from "react";

// A quiet, user-triggered success cue. There are no sounds for mistakes or timers.
export default function useZenChime(enabled: boolean) {
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
  return useCallback(() => {
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
      [392, 523.25].forEach((frequency, index) => {
        const start = audio.currentTime + index * 0.07;
        const tone = audio.createOscillator();
        const gain = audio.createGain();
        tone.type = "sine";
        tone.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.018, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
        tone.connect(gain);
        gain.connect(audio.destination);
        tone.start(start);
        tone.stop(start + 0.24);
      });
    } catch {
      /* The lesson always works without audio. */
    }
  }, [enabled]);
}
