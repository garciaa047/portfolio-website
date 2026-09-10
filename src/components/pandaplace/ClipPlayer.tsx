import React from "react";
import { fetchJson } from "./replay";

/** clips.json manifest: real MuJoCo footage rendered by scripts/export_clips.py. */
export interface Clip {
  file: string;
  success: number;
  solved_at: number | null;
  goal: number[];
}

export interface ClipsFile {
  theater: Record<string, Clip[]>;
  chronicle: (Clip & { steps: number; stage: string })[];
}

export const fetchClips = () => fetchJson<ClipsFile>("clips");

/**
 * ClipPlayer: real MuJoCo footage of the trained policy, desaturated to sit
 * inside the monochrome page. Hover or touch brings the colour back.
 * `onEnded` fires so the parent can advance to the next episode.
 */
export function ClipPlayer({
  clip,
  width = 480,
  loop = false,
  onEnded,
}: {
  clip: Clip;
  width?: number;
  loop?: boolean;
  onEnded?: () => void;
}) {
  const [hover, setHover] = React.useState(false);

  return (
    <video
      key={clip.file}
      src={`${import.meta.env.BASE_URL}pandaplace/clips/${clip.file}`}
      autoPlay
      loop={loop}
      muted
      playsInline
      onEnded={onEnded}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        display: "block",
        width: `min(${width}px, 100%)`,
        aspectRatio: "4 / 3",
        borderRadius: "var(--radius-sm)",
        border: "var(--border-hair)",
        filter: hover ? "none" : "grayscale(0.75) contrast(1.03)",
        transition: "filter 0.35s ease",
      }}
    />
  );
}
