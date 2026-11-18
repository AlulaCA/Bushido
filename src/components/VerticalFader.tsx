import React, { useRef } from 'react';

interface VerticalFaderProps {
  value: number; // 0 to 1
  label: string;
  accentClass?: string;
  muted?: boolean;
  onChange: (value: number) => void;
}

export const VerticalFader: React.FC<VerticalFaderProps> = ({
  value,
  label,
  accentClass = 'bg-red-500',
  muted = false,
  onChange,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const updateFromClientY = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = 1 - (clientY - rect.top) / rect.height;
    onChange(Math.max(0, Math.min(1, Number(ratio.toFixed(2)))));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return;
    updateFromClientY(e.clientY);
  };

  const pct = Math.round(value * 100);

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={`Fader volume ${label}`}
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          onChange(Math.min(1, Number((value + 0.05).toFixed(2))));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          onChange(Math.max(0, Number((value - 0.05).toFixed(2))));
        }
      }}
      className="relative w-6 h-24 rounded bg-[#08080A] border border-white/[0.08] cursor-ns-resize select-none flex items-center justify-center focus-visible:outline-2 focus-visible:outline-red-500 touch-none"
    >
      {/* Center slot */}
      <div className="w-1 h-20 rounded-full bg-white/[0.08] relative overflow-hidden">
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-full ${
            muted ? 'bg-zinc-600' : accentClass
          }`}
          style={{ height: `${pct}%` }}
        />
      </div>

      {/* Fader Cap */}
      <div
        className="absolute left-0.5 right-0.5 h-3 rounded-[2px] bg-zinc-200 border border-black/60 shadow-md pointer-events-none flex items-center justify-center"
        style={{
          bottom: `calc(${pct}% - ${pct * 0.12}px)`,
        }}
      >
        <div className="w-3 h-[1px] bg-zinc-700" />
      </div>
    </div>
  );
};
