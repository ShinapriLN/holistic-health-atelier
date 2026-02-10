"use client";

import { useRef, useState, useCallback, useEffect } from "react";

/**
 * BackgroundVideo — A dual-video crossfade component that follows the state machine:
 *   idle (loop) → stir (once) → pre-idle (once) → idle (loop)
 *
 * Exposes `triggerStir` via a ref callback so parent can trigger it from ingredient adds.
 */
export default function BackgroundVideo({ onStirRef, enabled = true }) {
  const VIDEOS = {
    idle: "/bg/idle.mp4",
    stir: "/bg/stir.mp4",
    preIdle: "/bg/pre-idle.mp4",
  };

  // We use two video layers (A and B) for crossfade
  const videoARef = useRef(null);
  const videoBRef = useRef(null);

  // Which layer is currently "front" (visible): "A" or "B"
  const [frontLayer, setFrontLayer] = useState("A");
  // Current phase: "idle" | "stir" | "preIdle"
  const phaseRef = useRef("idle");
  // Whether stir video is currently playing
  const stirPlayingRef = useRef(false);
  // Whether another stir was requested during playback
  const stirQueuedRef = useRef(false);

  const getFrontVideo = useCallback(() => {
    return frontLayer === "A" ? videoARef.current : videoBRef.current;
  }, [frontLayer]);

  const getBackVideo = useCallback(() => {
    return frontLayer === "A" ? videoBRef.current : videoARef.current;
  }, [frontLayer]);

  // Transition: load src into the back video, start it, then crossfade
  const transitionTo = useCallback(
    (src, loop = false) => {
      const back = getBackVideo();
      if (!back) return;

      back.src = src;
      back.loop = loop;
      back.muted = true;
      back.playsInline = true;

      const onCanPlay = () => {
        back.removeEventListener("canplay", onCanPlay);
        back.play().catch(() => {});

        // Flip layers after a small delay to let the back video start rendering
        setTimeout(() => {
          setFrontLayer((prev) => (prev === "A" ? "B" : "A"));
        }, 50);
      };

      back.addEventListener("canplay", onCanPlay);
      back.load();
    },
    [getBackVideo],
  );

  // Initialize idle on mount
  useEffect(() => {
    const videoA = videoARef.current;
    if (!videoA) return;
    videoA.src = VIDEOS.idle;
    videoA.loop = false;
    videoA.muted = true;
    videoA.playsInline = true;
    videoA.play().catch(() => {});
    phaseRef.current = "idle";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle "ended" event on the front video to chain stir → preIdle → idle
  useEffect(() => {
    const front = getFrontVideo();
    if (!front) return;

    const handleEnded = () => {
      if (phaseRef.current === "idle") {
        // Re-trigger idle with crossfade
        transitionTo(VIDEOS.idle, false);
      } else if (phaseRef.current === "stir") {
        stirPlayingRef.current = false;

        // Check if another stir was queued
        if (stirQueuedRef.current) {
          stirQueuedRef.current = false;
          // Play stir again
          phaseRef.current = "stir";
          stirPlayingRef.current = true;
          transitionTo(VIDEOS.stir, false);
        } else {
          // Move to pre-idle
          phaseRef.current = "preIdle";
          transitionTo(VIDEOS.preIdle, false);
        }
      } else if (phaseRef.current === "preIdle") {
        // Move back to idle
        phaseRef.current = "idle";
        transitionTo(VIDEOS.idle, false);
      }
    };

    front.addEventListener("ended", handleEnded);
    return () => front.removeEventListener("ended", handleEnded);
  }, [frontLayer, getFrontVideo, transitionTo]);

  // Pause/resume based on enabled prop
  useEffect(() => {
    const front = getFrontVideo();
    if (!front) return;
    if (!enabled) {
      front.pause();
    } else {
      front.play().catch(() => {});
    }
  }, [enabled, getFrontVideo]);

  // Trigger stir — called from parent when ingredient is added
  const triggerStir = useCallback(() => {
    if (!enabled) return; // Dynamic BG disabled
    if (stirPlayingRef.current) {
      // Stir is already playing — queue another one
      stirQueuedRef.current = true;
      return;
    }

    phaseRef.current = "stir";
    stirPlayingRef.current = true;
    stirQueuedRef.current = false;
    transitionTo(VIDEOS.stir, false);
  }, [enabled, transitionTo]);

  // Expose triggerStir to parent via ref callback
  useEffect(() => {
    if (onStirRef) {
      onStirRef.current = triggerStir;
    }
  }, [onStirRef, triggerStir]);

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex: 0, overflow: "hidden" }}
    >
      {/* Video Layer A */}
      <video
        ref={videoARef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: frontLayer === "A" ? 1 : 0,
          transition: "opacity 0.6s ease-in-out",
          zIndex: frontLayer === "A" ? 2 : 1,
        }}
        muted
        playsInline
      />
      {/* Video Layer B */}
      <video
        ref={videoBRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: frontLayer === "B" ? 1 : 0,
          transition: "opacity 0.6s ease-in-out",
          zIndex: frontLayer === "B" ? 2 : 1,
        }}
        muted
        playsInline
      />
    </div>
  );
}
