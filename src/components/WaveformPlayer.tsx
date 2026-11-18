import React, { useEffect, useRef } from 'react';

interface WaveformPlayerProps {
  peaks: number[];
  currentTime: number;
  duration: number;
  accentHex?: string;
  playheadHex?: string;
  onSeek: (timeSec: number) => void;
}

export function formatTimecode(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  peaks,
  currentTime,
  duration,
  accentHex = '#DC2626',
  playheadHex = '#A855F7',
  onSeek,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = 64;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const barCount = peaks.length || 120;
    const step = width / barCount;
    const barWidth = Math.max(2, step * 0.62);
    const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
    const playheadX = progress * width;
    const midY = height / 2;

    for (let i = 0; i < barCount; i++) {
      const x = i * step;
      const amp = peaks[i] ?? 0.2;
      const barH = Math.max(4, amp * (height - 10));
      const y = midY - barH / 2;

      const isPlayed = x + barWidth * 0.5 <= playheadX;
      ctx.fillStyle = isPlayed ? accentHex : 'rgba(255, 255, 255, 0.14)';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 1);
      ctx.fill();
    }

    // Playhead vertical line
    if (duration > 0) {
      ctx.fillStyle = playheadHex;
      ctx.fillRect(Math.max(0, Math.min(width - 2, playheadX - 1)), 0, 2, height);
    }
  }, [peaks, currentTime, duration, accentHex, playheadHex]);

  const handlePointerSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || duration <= 0) return;
    const rect = container.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div className="space-y-1.5">
      <div
        ref={containerRef}
        onClick={handlePointerSeek}
        role="slider"
        tabIndex={0}
        aria-label="Posisi pemutaran audio"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') onSeek(Math.min(duration, currentTime + 2));
          if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentTime - 2));
        }}
        className="relative w-full h-16 cursor-pointer rounded-md bg-[#050507] border border-white/[0.08] px-2 flex items-center focus-visible:outline-2 focus-visible:outline-red-500"
      >
        <canvas ref={canvasRef} className="w-full h-16 block" />
      </div>
      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-zinc-400">
        <span>{formatTimecode(currentTime)}</span>
        <span>{formatTimecode(duration)}</span>
      </div>
    </div>
  );
};
