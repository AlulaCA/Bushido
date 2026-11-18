import React, { useEffect } from 'react';
import { Activity, X } from 'lucide-react';
import type { ActivityLogItem } from '../types/studio';

interface ActivityModalProps {
  isOpen: boolean;
  logs: ActivityLogItem[];
  onClose: () => void;
  onClear: () => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  logs,
  onClose,
  onClear,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-[#111115] border border-white/[0.1] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-500" />
            <h2 id="activity-modal-title" className="text-sm font-bold text-zinc-100">
              Activity &amp; Session Log
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded hover:bg-white/[0.06] transition-colors"
              >
                Bersihkan
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup log aktivitas"
              className="w-8 h-8 rounded-md inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-2.5">
          {logs.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              Belum ada aktivitas pada sesi ini. Mulai dengan membuat lirik AI atau generate lagu.
            </p>
          ) : (
            logs.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-[#08080A] border border-white/[0.07] flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-100">{item.title}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{item.detail}</div>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-zinc-500 shrink-0">
                  {item.timestamp}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
