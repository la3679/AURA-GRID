import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { LANE_CONFIG } from '@aura-grid/shared';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

const CAPTIONS = [
  'Roll the signal.',
  'Split its power across six tactical lanes.',
  'Advance your markers with exact allocation.',
  'Land on your rival to purge their progress.',
  'Capture three lanes to shut down the grid.',
  'Gemini-powered commentary tracks every turning point.',
  'Build your profile. Climb the leaderboard. Own the Grid.',
];

const VIDEO_SRC = '/videos/aura-grid-demo.mp4';

/**
 * Hero explainer. Attempts to load a real MP4; if unavailable, renders an
 * accessible animated, video-like product demo with captions and play/pause.
 */
export const HeroExplainerVideo = () => {
  const reduced = useReducedMotion();
  const [hasVideo, setHasVideo] = useState(false);
  const [playing, setPlaying] = useState(!reduced);
  const [caption, setCaption] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Probe for the optional MP4 without throwing if it's missing.
  useEffect(() => {
    let active = true;
    const probe = document.createElement('video');
    probe.src = VIDEO_SRC;
    probe.onloadeddata = () => active && setHasVideo(true);
    probe.onerror = () => active && setHasVideo(false);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hasVideo || !playing) return;
    const t = setInterval(() => setCaption((c) => (c + 1) % CAPTIONS.length), 2200);
    return () => clearInterval(t);
  }, [hasVideo, playing]);

  if (hasVideo) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--border)]">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster="/videos/poster.png"
          controls
          muted
          playsInline
          className="aspect-video w-full"
          aria-label="AURA-GRID product demo"
        />
      </div>
    );
  }

  return (
    <div
      className="aura-grid-bg relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
      role="img"
      aria-label="Animated AURA-GRID demo: roll, split across six lanes, bump, and capture three lanes to win."
    >
      <div className="flex aspect-video flex-col justify-between p-6">
        <div className="flex items-end justify-center gap-2 md:gap-3">
          {LANE_CONFIG.map((_lane, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <motion.div
                className="w-7 rounded-md md:w-9"
                style={{
                  height: 96,
                  background:
                    'linear-gradient(to top, var(--primary), transparent)',
                  opacity: 0.25,
                }}
              />
              <motion.div
                className="h-2 w-7 rounded-full bg-[var(--primary)] md:w-9"
                animate={
                  reduced || !playing
                    ? { y: 0 }
                    : { y: [0, -((i % 4) + 1) * 16, 0] }
                }
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.15 }}
              />
              <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                L{i + 1}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <p
            key={caption}
            className="font-display text-sm font-medium text-[var(--foreground)] md:text-base"
            aria-live="polite"
          >
            {CAPTIONS[caption]}
          </p>
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause demo' : 'Play demo'}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--primary)]"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
