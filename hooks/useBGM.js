"use client";

import { useRef, useEffect, useCallback, useState } from "react";

const STORAGE_KEY_VOLUME = "bgm_volume";
const STORAGE_KEY_MUTED = "bgm_muted";

function loadSetting(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Custom hook for managing background music with persistent settings.
 *
 * - Creates an <audio> element that autoplays muted and loops.
 * - `unmute()` — unmutes and plays (for first-time users clicking "ตกลง").
 * - `tryAutoplayUnmuted()` — for returning users: attempts unmuted playback.
 * - `toggleMute()` / `setVolume()` — settings panel controls, persisted to localStorage.
 */
export function useBGM(src = "/bgm/bgm.mp3") {
  const audioRef = useRef(null);
  const [volume, _setVolume] = useState(() =>
    loadSetting(STORAGE_KEY_VOLUME, 0.4),
  );
  const [isMuted, _setMuted] = useState(() =>
    loadSetting(STORAGE_KEY_MUTED, true),
  );

  // Create the audio element once on mount
  useEffect(() => {
    const savedVolume = loadSetting(STORAGE_KEY_VOLUME, 0.4);
    const audio = new Audio(src);
    audio.loop = true;
    audio.muted = true; // Always start muted for autoplay to work
    audio.volume = savedVolume;
    audioRef.current = audio;

    // Attempt muted autoplay immediately
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src]);

  /** Set volume (0–1) and persist */
  const setVolume = useCallback((v) => {
    const clamped = Math.max(0, Math.min(1, v));
    _setVolume(clamped);
    localStorage.setItem(STORAGE_KEY_VOLUME, JSON.stringify(clamped));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  /** Toggle mute and persist */
  const toggleMute = useCallback(() => {
    _setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_MUTED, JSON.stringify(next));
      if (audioRef.current) {
        audioRef.current.muted = next;
        if (!next) audioRef.current.play().catch(() => {});
      }
      return next;
    });
  }, []);

  /** Unmute and ensure playback (used when user clicks "ตกลง") */
  const unmute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    _setMuted(false);
    localStorage.setItem(STORAGE_KEY_MUTED, JSON.stringify(false));
    audio.play().catch(() => {});
  }, []);

  /**
   * For returning users: try to play unmuted.
   * If the browser rejects it, fall back to unmuting on first click anywhere.
   */
  const tryAutoplayUnmuted = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Respect saved mute preference
    const savedMuted = loadSetting(STORAGE_KEY_MUTED, false);
    if (savedMuted) {
      // User previously chose to mute — keep it muted
      audio.muted = true;
      _setMuted(true);
      return;
    }

    audio.muted = false;
    _setMuted(false);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Browser blocked unmuted autoplay — mute again and wait for interaction
        audio.muted = true;
        _setMuted(true);
        audio.play().catch(() => {});

        const handleClick = () => {
          audio.muted = false;
          _setMuted(false);
          localStorage.setItem(STORAGE_KEY_MUTED, JSON.stringify(false));
          audio.play().catch(() => {});
        };
        document.addEventListener("click", handleClick, { once: true });
      });
    }
  }, []);

  return { unmute, tryAutoplayUnmuted, volume, setVolume, isMuted, toggleMute };
}
